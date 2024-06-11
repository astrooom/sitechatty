from app.utils.decorators import login_required
from flask import Blueprint, jsonify, request, session
from app import db, socketio
from flask_socketio import emit, join_room, disconnect
from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity
)
from app.config import Config
from app.models.models import SiteAddedSources, Site, User
from app.utils.validation import validate_form
from app.validation.site import AddScanForm, CreateForm, CrawlerCrawlForm, AddTextInputForm, UpdateTextInputForm, AddAddedWebpagesForm
from app.utils.celery import crawl_urls, scan_url
from app.utils.vector import get_collection, get_combined_source_chunks, generate_upsertables, get_search_results
from datetime import datetime, timezone
from app.utils.socket import generate_socket_token, verify_socket_token, store_socket_id_data, get_socket_id_data

site = Blueprint('site', __name__)

@site.route('/', methods=['POST'])
@login_required
def create():
    """
    This endpoint is used to create a new site.
    """
    user_id = session["user_id"]
    
    form = validate_form(CreateForm, request.get_json(silent=True))
    name = form.name.data
    
    # Check if the user is surpassing their max_sites limit.
    if Site.query.filter_by(user_id=user_id).count() >= User.query.filter_by(id=user_id).first().max_sites:
        return jsonify({"error": "Max sites reached"}), 403
    
    # Check if the user has already created a site with the same name
    if Site.query.filter_by(name=name, user_id=user_id).first():
        return jsonify({"error": "Site already exists"}), 409
    
    site = Site(name=name, user_id=user_id)
    db.session.add(site)
    db.session.commit()
    
    return jsonify({"message": "Site created successfully"}), 201

@site.route('/', methods=['GET'])
@jwt_required()
def get():
    """
    This endpoint is used to get all sites of the current user.
    """
    user_id = get_jwt_identity()
    sites = Site.query.filter_by(user_id=user_id).all()
    return jsonify({"sites": [site.to_dict() for site in sites]}), 200

@site.route('/<int:site_id>', methods=['DELETE'])
@login_required
def delete(site_id):
    """
    This endpoint is used to delete a site incl. all related urls.
    """
    user_id = session["user_id"]
    
    # Check that the site belongs to the user
    site = Site.query.filter_by(id=site_id, user_id=user_id).first()
    if not site:
        return jsonify({"error": "Site not found"}), 404
    
    db.session.delete(site)
    db.session.commit()
    
    return jsonify({"message": "Site deleted successfully"}), 200

@site.route('/<int:site_id>/added-sources', methods=['GET'])
@jwt_required()
def get_scanned_urls(site_id):
    """
    This endpoint is used to get all added sources for a site.
    """
    user_id = get_jwt_identity()

    # Check that the site belongs to the user
    site = Site.query.filter_by(id=site_id, user_id=user_id).first()
    if not site:
        return jsonify({"error": "Site not found"}), 404

    # Get all added sources for the site
    results = SiteAddedSources.query.filter_by(site_id=site_id).all()
    response = [result.to_dict() for result in results]

    all_sources = {result['source'] for result in response}

    if all_sources:
        # Get entries which are already in used sources (vector db)
        collection_name = f"{site.name}_{user_id}"
        query_results = get_collection(collection_name).get(where={"source": {"$in": list(all_sources)}}, include=["metadatas"]) 
        used_sources = {metadata['source'] for metadata in query_results['metadatas']} if query_results['metadatas'] else set()
    else:
        used_sources = set()

    # Update the response with is_used status
    for row in response:
        row["is_used"] = row["source"] in used_sources

    return jsonify(response), 200

@site.route('/<int:site_id>/added-sources/webpage', methods=['POST'])
@jwt_required()
def add_added_source(site_id):
    """
    This endpoint is used to add an added source (url) to a site.
    """
    user_id = get_jwt_identity()
    
    json = request.get_json(silent=True)
    combined_data = {**json, "site_id": site_id}
    form = validate_form(AddAddedWebpagesForm, combined_data)
    
    # Check that the site belongs to the user
    site = Site.query.filter_by(id=site_id, user_id=user_id).first()
    if not site:
        return jsonify({"error": "Site not found"}), 404
        
    existing_source = SiteAddedSources.query.filter_by(site_id=site_id, source=form.url.data).first()
    if existing_source:
        # Update existing to set new updated_at but keep other values the same
        existing_source.updated_at = datetime.now(timezone.utc)
        db.session.commit()
        return jsonify({"added_source_id": existing_source.id}), 200
    else:
        added_source = SiteAddedSources(site_id=site_id, source=form.url.data, source_type="webpage")
        db.session.add(added_source)
        db.session.commit()
        
        return jsonify({"added_source_id": added_source.id}), 200

@site.route('/<int:site_id>/added-sources/<int:added_source_id>', methods=['DELETE'])
@jwt_required()
def delete_added_source(site_id, added_source_id):
    """
    This endpoint is used to delete an added source from a site.
    """
    user_id = get_jwt_identity()
    
    # Check that the site belongs to the user
    site = Site.query.filter_by(id=site_id, user_id=user_id).first()
    if not site:
        return jsonify({"error": "Site not found"}), 404
    
    # Check that the added source belongs to the site
    added_source = SiteAddedSources.query.filter_by(id=added_source_id, site_id=site_id).first()
    if not added_source:
        return jsonify({"error": "Added source not found."}), 404
    
    # Check if the added source URL is in used_sources (vector db)
    collection_name = f"{site.name}_{user_id}"
    query_results = get_collection(collection_name).get(where={"source": added_source.source}, include=["metadatas"]) 
    if query_results['ids']:
        return jsonify({"error": "You may not delete an added source that is in use. Please make sure to unuse it first."}), 400
    
    # Delete the added source
    db.session.delete(added_source)
    db.session.commit()
    
    return jsonify({"message": "Added source deleted successfully"}), 200

@site.route('/<int:site_id>/added-sources/scan', methods=['POST'])
@jwt_required()
def scan(site_id):
    """
    This endpoint is used to recursively scan more urls from a website's "main" url and put them in the db.
    """
    
    user_id = get_jwt_identity()

    # Check that the site exists and belongs to the user
    site = Site.query.filter_by(id=site_id, user_id=user_id).first()
    
    if not site:
        return jsonify({"error": "Site not found"}), 404
    
    combined_data = {**request.get_json(silent=True), "site_id": site_id}
    
    form = validate_form(AddScanForm, combined_data)
    
    url = form.url.data # Url is validated to only be a base url.
    # If url ends with /, remove it
    if url.endswith('/'):
        url = url[:-1]

    # Remove trailing / from input base url if present
    if url.endswith('/'):
        url = url[:-1]

    max_depth = form.max_depth.data

    site_added_sources_count = SiteAddedSources.query.filter_by(site_id=site_id).count()
    if site_added_sources_count >= site.max_urls_allowed:
        return jsonify({"error": f"Reached the maximum limit of {site.max_urls_allowed} added sources."}), 400

    task = scan_url.apply_async(
        args=[str(url), int(site_id), int(max_depth)], kwargs={"user_id": site.user.id, "display_name": "Scanning URLs", "do_periodical_refresh": True},
    )

    return jsonify({"task_id": task.id}), 202

# @site.route('/<int:site_id>/crawler/crawl', methods=['POST'])
# @login_required
# def crawler_pull(site_id):
#     """
#     This endpoint is used to pull the contents of a website's "scanned" urls and put them in a vector DB collection.
#     """
#     user_id = session["user_id"]
    
#     json = request.get_json(silent=True)
#     combined_data = {**json, "site_id": site_id}
    
#     form = validate_form(CrawlerCrawlForm, combined_data)
    
#     site_id = form.site_id.data
#     urls = form.urls.data # Will be chooseable through the UI.
#     all_urls = form.all_urls.data
#     delete_first = form.delete_first.data
#     do_cleanup = form.do_cleanup.data
    
#     if delete_first:
#         return jsonify({"error": "Disabled for security."}), 400
    
#     if do_cleanup and not all_urls:
#         return jsonify({"error": "Must use all_urls if do_cleanup is true"}), 400
    
#     if all_urls:
#         # Get all from site -> main urls -> scanned urls
#         # Site -> Main urls -> Scanned urls
#         main_url_alias = aliased(ScannerMainUrl)
#         site_scanned_query = db.session.query(ScannerFoundUrls.url).join(main_url_alias, ScannerFoundUrls.main_id == main_url_alias.id).filter(main_url_alias.site_id == site_id).all()
#         urls = [result[0] for result in site_scanned_query]

#     task = crawl_urls.apply_async(
#         args=[int(site_id), list(urls), bool(delete_first), bool(do_cleanup)],
#     )

#     return jsonify({"task_id": task.id}), 202

@site.route('/<int:site_id>/used-sources', methods=['GET'])
@jwt_required()
def sites_get_unused_sources(site_id):
    """
    This endpoint is used to get the contents of all sources from the vector db.
    It will combine all the chunks of each source with their metadata.
    """
    user_id = get_jwt_identity()
    
    # Check that the site belongs to the user
    site = Site.query.filter_by(id=site_id, user_id=user_id).first()
    if not site:
        return jsonify({"error": "Site not found"}), 404
    
    collection_name = f"{site.name}_{user_id}"
    collection = get_collection(collection_name)
    
    # Retrieve all documents with their metadatas
    sources = collection.get(include=["metadatas", "documents"])
    
    if not sources['ids']:
        return jsonify([])

    # Dictionary to hold metadata by source
    combined_sources = {}

    # Combine all chunks of each source
    for id_, metadata, document in zip(sources['ids'], sources['metadatas'], sources['documents']):
        source = metadata['source']

        # Initialize metadata
        if source not in combined_sources:
            combined_sources[source] = metadata
            combined_sources[source]['id'] = id_
    
    # Convert combined_sources to a list of dicts
    combined_sources_list = list(combined_sources.values())
    
    return jsonify(combined_sources_list), 200

@site.route('/<int:site_id>/used-sources/<int:added_source_id>', methods=['POST'])
@jwt_required()
def sites_use_source(site_id, added_source_id):
    """
    This endpoint is used to add a source (url) (incl. scanning its contents) to the Vector DB from the added-sources
    """
    user_id = get_jwt_identity()
    
    # Check that the site belongs to the user
    site = Site.query.filter_by(id=site_id, user_id=user_id).first()
    if not site:
        return jsonify({"error": "Site not found"}), 404
    
    added_source = SiteAddedSources.query.filter_by(id=added_source_id).first()
    
    # Get the added_source from the source id
    if not added_source:
        return jsonify({"error": "Source not found"}), 404
    
    urls = [added_source.source]
    delete_first = False # it's CRITICAL that this is False because it will delete the vector db collection.
    do_cleanup = False # it's CRITICAL that this is False because it should ONLY be used when doing a full crawl of all urls which are used.
    task = crawl_urls.apply_async(
        args=[int(site_id), list(urls), bool(delete_first), bool(do_cleanup)], 
        kwargs={"user_id": user_id, "display_name": "Adding a source"}
    )

    return jsonify({"task_id": task.id}), 202

@site.route('/<int:site_id>/used-sources/text-input', methods=['POST'])
@jwt_required()
def sites_use_text_input(site_id):
    """This endpoint is used to add raw input text to the vector db"""
    user_id = get_jwt_identity()
    site = Site.query.filter_by(id=site_id, user_id=user_id).first()
    if not site:
        return jsonify({"error": "Site not found"}), 404
    
    json = request.get_json(silent=True)
    form = validate_form(AddTextInputForm, json)
    
    title = form.title.data
    content = form.content.data
    
    collection_name = f"{site.name}_{site.user_id}"
    collection = get_collection(collection_name)
    
    # Make sure the source doesn't already exist
    query_results = collection.get(where={"source": title}, include=["metadatas"])
    if query_results['ids']:
        return jsonify({"error": "There is already a source with this title."}), 409
    
    upsertables = generate_upsertables(source=title, source_type="input", content=content)
    for upsertable in upsertables:
        collection.upsert(
            documents=[upsertable['document']],
            metadatas=[upsertable['metadata']],
            ids=[upsertable['id']]
        )
        
    return jsonify({"message": "Text input added successfully"}), 200

@site.route('/<int:site_id>/used-sources/text-input', methods=['PATCH'])
@jwt_required()
def sites_update_text_input(site_id):
    """This endpoint is used to update raw input text in the vector db"""
    user_id = get_jwt_identity()
    site = Site.query.filter_by(id=site_id, user_id=user_id).first()
    if not site:
        return jsonify({"error": "Site not found"}), 404
    
    json = request.get_json(silent=True)
    form = validate_form(UpdateTextInputForm, json)
    
    current_title = form.current_title.data
    title = form.title.data
    content = form.content.data
    
    collection_name = f"{site.name}_{site.user_id}"
    collection = get_collection(collection_name)
    
    # Make sure the source exists
    query_results = collection.get(where={"source": current_title}, include=["metadatas"])
    if not query_results['ids']:
        return jsonify({"error": "There is no source with this title."}), 404
    
    # Delete all the old upsertables
    collection.delete(ids=query_results['ids'])
    
    # Insert new upsertables
    upsertables = generate_upsertables(source=title, source_type="input", content=content)
    for upsertable in upsertables:
        collection.upsert(
            documents=[upsertable['document']],
            metadatas=[upsertable['metadata']],
            ids=[upsertable['id']]
        )
        
    return jsonify({"message": "Text input updated successfully"}), 200

# Endpoint to get used source
@site.route('/<int:site_id>/used-sources/<path:source>', methods=['GET'])
@jwt_required()
def sites_get_used_source(site_id, source):
    user_id = get_jwt_identity()
    site = Site.query.filter_by(id=site_id, user_id=user_id).first()
    if not site:
        return jsonify({"error": "Site not found"}), 404

    collection_name = f"{site.name}_{site.user_id}"
    collection = get_collection(collection_name)
    
    query_results = collection.get(where={"source": source}, include=["metadatas", "documents"])
    
    combined_documents = get_combined_source_chunks(query_results)
    if combined_documents is None:
        return jsonify({'contents': ''}), 404
    
    # Safely retrieve the source_type
    source_type = None
    if query_results.get('metadatas'):
        metadata_first_item = query_results.get('metadatas')[0]
        if metadata_first_item:
            source_type = metadata_first_item.get('source_type', None)
    
    return jsonify({'contents': combined_documents, 'source_type': source_type}), 200

@site.route('/<int:site_id>/used-sources/<path:source>', methods=['DELETE'])
@jwt_required()
def sites_unuse_source(site_id, source):
    user_id = get_jwt_identity()
    site = Site.query.filter_by(id=site_id, user_id=user_id).first()
    if not site:
        return jsonify({"error": "Site not found"}), 404

    collection_name = f"{site.name}_{site.user_id}"
    collection = get_collection(collection_name)
    
    query_results = collection.get(where={"source": source}, include=["metadatas"])
    if not query_results['ids']:
        return jsonify({"error": "Source not found"}), 404
    
    collection.delete(ids=query_results['ids'])
    
    return jsonify({"message": "Source removed successfully"}), 200

@site.route('/<int:site_id>/crawler-count', methods=['GET'])
@login_required
def crawler_count(site_id):
    """
    This endpoint is used to get the number of urls in a website's "scanned" urls from the Vector DB.
    """
    user_id = session["user_id"]
    
    # Check that the site belongs to the user
    site = Site.query.filter_by(id=site_id, user_id=user_id).first()
    if not site:
        return jsonify({"error": "Site not found"}), 404
    
    collection_name = f"{site.name}_{site.user_id}"
    collection = get_collection(collection_name)
    
    return jsonify({"count": collection.count()}), 200

@site.route('/<int:site_id>/similarity-search', methods=['POST'])
@login_required
def similarity_search(site_id):
    # ADMIN ENDPOINT
    """
    This endpoint is used to get results of a similarity search from the vector db through a query
    """
    user_id = session["user_id"]
    
    json = request.get_json(silent=True)
    combined_data = {**json, "site_id": site_id}
    
    # Check that the site belongs to the user
    site = Site.query.filter_by(id=site_id, user_id=user_id).first()
    if not site:
        return jsonify({"error": "Site not found"}), 404
    
    query = combined_data['query']
    
    search_results = get_search_results(query, site)
    
    return jsonify({"search_results": search_results}), 200

@site.route('/<int:site_id>/playground/ws-details/<string:type>', methods=['GET'])
@jwt_required()
def site_ws_details(site_id, type):
    user_id = get_jwt_identity()
    site = Site.query.filter_by(id=site_id, user_id=user_id).first()
    if not site:
        return jsonify({"error": "Site not found"}), 404
    
    if type not in ['query', 'sources']:
        return jsonify({"error": "Invalid type"}), 400

    # Generate a WS token and store in the redis db. Make valid for 15 mins.
    # When its about to expire, an event is sent out to the socket client to reconnect.
    ws_token = generate_socket_token(type, user_id, site_id)

    return jsonify({"ws_url": Config.PUBLIC_URL + f"/{type}", "ws_token": ws_token}), 200

@socketio.on('join', namespace='/sources')
def handle_join(data):
    
    type = 'sources'
    
    token = data.get('token')
    site_id = data.get('site_id')
        
    try:
        _token_type, user_id, site_id = verify_socket_token(type, token, site_id)
    except Exception as e:
        emit('error', {'msg': 'Could not verify socket token.'})
        disconnect()
        return
    
    room = f"{type}_{user_id}_{site_id}"
    
    # Store the socket ID and associated user_id and site_id in Redis
    socket_id = request.sid
    store_socket_id_data(socket_id, user_id, site_id, room)
    
    join_room(room)
    emit('status', {'msg': f'{user_id} has entered the room.'}, room=room)
    
# Receive ping event and send back time before expiration if close to expiry
@socketio.on('ping', namespace='/sources')
def handle_ping():
    try:
        user_id, site_id, room, remaining_ttl = get_socket_id_data(request.sid)
    except Exception as e:
        emit('error', {'msg': 'Could not verify socket id.'})
        disconnect()
        return
    
    # If the socket is about to expire, send back "expiring" event
    if remaining_ttl < 120:
        emit('expiring', {'remaining_seconds': remaining_ttl}, room=room)
        return
    
@socketio.on('search', namespace='/sources')
def handle_search(data):
    
    print(f"[handle_search] -> Received {data}")
    
    try:
        user_id, site_id, room, _remaining_ttl = get_socket_id_data(request.sid)
    except Exception as e:
        emit('error', {'msg': 'Could not verify socket id.'})
        disconnect()
        return

    query_input = data.get('query')
    site = Site.query.filter_by(id=site_id, user_id=user_id).first()
    if not site:
        emit('error', {'msg': 'Site not found'})
        return

    search_results = get_search_results(query_input, site)
    print(f"[handle_search] -> Search results: {search_results}")
    
    emit('message', {
        'content': search_results,
        'sender': "Search Bot",
        'datetime': datetime.now(timezone.utc).isoformat()}, room=room)