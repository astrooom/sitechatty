from collections import defaultdict
from app.utils.decorators import login_required
from flask import Blueprint, jsonify, request, session
from app import db
from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity
)
from app.models.models import ScannerMainUrl, ScannerFoundUrls, Site, User
from app.utils.validation import validate_form
from app.validation.site import ScannerScanForm, CreateForm, CrawlerCrawlForm, AddTextInputForm
from app.utils.celery import scan_url, crawl_urls
from sqlalchemy.orm import aliased
from app.utils.vector import get_collection, get_combined_source_chunks, generate_upsertables, get_search_results
import json

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
    This endpoint is used to get all main URLs and scanned URLs from a site.
    """
    user_id = get_jwt_identity()
    
    main_url_alias = aliased(ScannerMainUrl)

    # Combined query to check site ownership and get all main URLs and their scanned URLs
    results = (
        db.session.query(
            main_url_alias.id.label('main_id'),
            main_url_alias.url.label('main_url'),
            ScannerFoundUrls.id.label('scanned_id'),  # Select the id of ScannerFoundUrls
            ScannerFoundUrls.url.label('scanned_url'),
            ScannerFoundUrls.type.label('type'),
            Site.name.label('site_name')
        )
        .outerjoin(ScannerFoundUrls, ScannerFoundUrls.main_id == main_url_alias.id)
        .join(Site, main_url_alias.site_id == Site.id)
        .join(User, Site.user_id == User.id)
        .filter(User.id == user_id, Site.id == site_id)
        .all()
    )
    
    if not results:
        # Check if the site exists to distinguish between no URLs and no site
        site_exists = (
            db.session.query(Site.id)
            .join(User)
            .filter(User.id == user_id, Site.id == site_id)
            .first()
        )
        if not site_exists:
            return jsonify({"error": "Site not found"}), 404

    response = []
    all_urls = []
    added_main_urls = set()
    site_name = results[0].site_name if results else ""

    # Collect all URLs and build initial response
    for row in results:
        if row.main_id not in added_main_urls:
            all_urls.append(row.main_url)
            response.append({
                "url": row.main_url,
                "type": None,
                "is_main": True,
                "id": row.main_id,
                "site_id": site_id,
                "is_used": False
            })
            added_main_urls.add(row.main_id)

        if row.scanned_url:
            all_urls.append(row.scanned_url)
            response.append({
                "url": row.scanned_url,
                "type": row.type,
                "is_main": False,
                "id": row.scanned_id,
                "site_id": site_id,
                "is_used": False
            })

    # Get entries which are already in used sources (vector db)
    collection_name = f"{site_name}_{user_id}"
    query_results = get_collection(collection_name).get(where={"source": {"$in": all_urls}}, include=["metadatas"]) 
    used_sources = {metadata['source'] for metadata in query_results['metadatas']} if query_results['metadatas'] else set()
    
    # Update the response with is_used status
    for row in response:
        if row["url"] in used_sources:
            row["is_used"] = True

    return jsonify(response), 200

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
    
    # Check that the added source belongs to the site via ScannerMainUrl
    added_source = (
        db.session.query(ScannerFoundUrls)
        .join(ScannerMainUrl, ScannerFoundUrls.main_id == ScannerMainUrl.id)
        .filter(ScannerFoundUrls.id == added_source_id, ScannerMainUrl.site_id == site_id)
        .first()
    )
    
    if not added_source:
        return jsonify({"error": "Added source not found."}), 404
    
    # Check if the added source URL is in used_sources (vector db)
    collection_name = f"{site.name}_{user_id}"
    query_results = get_collection(collection_name).get(where={"source": added_source.url}, include=["metadatas"]) 
    if query_results['ids']:
        return jsonify({"error": "You may not delete an added source that is in use. Please make sure to unuse it first."}), 400
    
    # Delete the added source
    db.session.delete(added_source)
    db.session.commit()
    
    return jsonify({"message": "Added source deleted successfully"}), 200

@site.route('/<int:site_id>/scanner/scan', methods=['POST'])
@jwt_required()
def scan(site_id):
    """
    This endpoint is used to recursively scan urls from a website's "main" url and put them in the db.
    """
    
    user_id = get_jwt_identity()

    # Check that the site exists and belongs to the user
    site = Site.query.filter_by(id=site_id, user_id=user_id).first()
    
    if not site:
        return jsonify({"error": "Site not found"}), 404
        
    json = request.get_json(silent=True)
    combined_data = {**json, "site_id": site_id}
    
    form = validate_form(ScannerScanForm, combined_data)
    
    base_url = form.base_url.data
    site_id = form.site_id.data

    # Remove trailing / from input base url if present
    if base_url.endswith('/'):
        base_url = base_url[:-1]

    max_depth = json.get('max_depth', 2)

    main_url_record = ScannerMainUrl.query.filter_by(
        url=base_url, site_id=site_id).first()
    if main_url_record:
        count = ScannerFoundUrls.query.filter_by(
            main_id=main_url_record.id).count()

        if count >= main_url_record.max_urls_allowed:
            return jsonify({"error": f"Reached the maximum limit of {main_url_record.max_urls_allowed} URLs. Stopping crawl."}), 400

    task = scan_url.apply_async(
        args=[str(base_url), int(site_id), int(max_depth)], kwargs={"user_id": site.user.id}
    )

    return jsonify({"task_id": task.id}), 202

@site.route('/<int:site_id>/crawler/crawl', methods=['POST'])
@login_required
def crawler_pull(site_id):
    """
    This endpoint is used to pull the contents of a website's "scanned" urls and put them in a vector DB collection.
    """
    user_id = session["user_id"]
    
    json = request.get_json(silent=True)
    combined_data = {**json, "site_id": site_id}
    
    form = validate_form(CrawlerCrawlForm, combined_data)
    
    site_id = form.site_id.data
    urls = form.urls.data # Will be chooseable through the UI.
    all_urls = form.all_urls.data
    delete_first = form.delete_first.data
    do_cleanup = form.do_cleanup.data
    
    if delete_first:
        return jsonify({"error": "Disabled for security."}), 400
    
    if do_cleanup and not all_urls:
        return jsonify({"error": "Must use all_urls if do_cleanup is true"}), 400
    
    if all_urls:
        # Get all from site -> main urls -> scanned urls
        # Site -> Main urls -> Scanned urls
        main_url_alias = aliased(ScannerMainUrl)
        site_scanned_query = db.session.query(ScannerFoundUrls.url).join(main_url_alias, ScannerFoundUrls.main_id == main_url_alias.id).filter(main_url_alias.site_id == site_id).all()
        urls = [result[0] for result in site_scanned_query]

    task = crawl_urls.apply_async(
        args=[int(site_id), list(urls), bool(delete_first), bool(do_cleanup)],
    )

    return jsonify({"task_id": task.id}), 202

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

    # Dictionary to hold combined contents by source
    combined_sources = defaultdict(lambda: {"metadatas": {}, "contents": []})

    # Combine all chunks of each source
    for id_, metadata, document in zip(sources['ids'], sources['metadatas'], sources['documents']):
        json_content = json.loads(document)
        chunk_index = json_content['chunk_index']
        content = json_content['content']
        source = metadata['source']

        # Initialize metadata and combine contents
        if 'id' not in combined_sources[source]:
            combined_sources[source].update(metadata)
            combined_sources[source]['id'] = id_
        
        combined_sources[source]['contents'].append((chunk_index, content))
    
    # Sort contents by chunk_index and join them
    for source, data in combined_sources.items():
        data['contents'].sort(key=lambda x: x[0])
        data['contents'] = "".join([content for _, content in data['contents']])
    
    # Convert combined_sources to a list of dicts
    combined_sources_list = list(combined_sources.values())
    
    return jsonify(combined_sources_list), 200

@site.route('/<int:site_id>/added-sources/<int:added_source_id>', methods=['POST'])
@jwt_required()
def sites_add_source(site_id, added_source_id):
    """
    This endpoint is used to add a url (incl. scanning its contents) to the Vector DB.
    """
    user_id = get_jwt_identity()
    
    # Check that the site belongs to the user
    site = Site.query.filter_by(id=site_id, user_id=user_id).first()
    if not site:
        return jsonify({"error": "Site not found"}), 404
    
    # Get the scanned url from the source id
    scannedUrl = ScannerFoundUrls.query.filter_by(id=added_source_id).first()
    if not scannedUrl:
        return jsonify({"error": "Source not found"}), 404
    
    urls = [scannedUrl.url]
    delete_first = False
    do_cleanup = False
    
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
    
    upsertables = generate_upsertables(source=title, source_type="input", content=content)
    for upsertable in upsertables:
        collection.upsert(
            documents=[upsertable['document']],
            metadatas=[upsertable['metadata']],
            ids=[upsertable['id']]
        )
        
    return jsonify({"message": "Text input added successfully"}), 200
    

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
    
    combined_documents = get_combined_source_chunks(collection, source)
    if combined_documents is None:
        return jsonify({'contents': ''}), 404
    
    return jsonify({'contents': combined_documents}), 200

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

@site.route('/<int:site_id>/chat', methods=['POST'])
@login_required
def chat(site_id):
    user_id = session["user_id"]
    
    json = request.get_json(silent=True)
    combined_data = {**json, "site_id": site_id}
    
    # Check that the site belongs to the user
    site = Site.query.filter_by(id=site_id, user_id=user_id).first()
    if not site:
        return jsonify({"error": "Site not found"}), 404
    
    # Find some way to store chatr history and retrieve it for the same chat window if reloading for example.
    
    query = combined_data['query']
    search_results = get_search_results(query, site)
    
    # Add chat history to db.

