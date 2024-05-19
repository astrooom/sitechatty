from app.utils.decorators import login_required_or_bearer_token, login_required
from flask import Blueprint, jsonify, request, session
from app import db, chroma_client
from app.models.models import ScannerMainUrl, ScannerFoundUrls, Site, User
from app.utils.validation import validate_form
from app.validation.site import ScannerScanForm, CreateForm, CrawlerCrawlForm
from app.utils.celery import scan_url, crawl_urls
from sqlalchemy.orm import aliased
from langchain_community.vectorstores import Chroma
from app.utils.embeddings import embeddings

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

@site.route('/<int:site_id>/scanner/scan', methods=['POST'])
@login_required
def scan(site_id):
    """
    This endpoint is used to recursively scan urls from a website's "main" url and put them in the db.
    """
    user_id = session["user_id"]
    
    # Check that the site belongs to the user
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
        args=[str(base_url), int(site_id), int(max_depth)]
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
    
    if all_urls:
        # Get all scanned urls from site
        # Site -> Main urls -> Scanned urls
        main_url_alias = aliased(ScannerMainUrl)
        site_scanned_query = db.session.query(ScannerFoundUrls.url).join(main_url_alias, ScannerFoundUrls.main_id == main_url_alias.id).filter(main_url_alias.site_id == site_id).all()
        urls = [result[0] for result in site_scanned_query]

    task = crawl_urls.apply_async(
        args=[int(site_id), list(urls)],
    )

    return jsonify({"task_id": task.id}), 202

@site.route('/<int:site_id>/crawler', methods=['GET'])
@login_required
def crawler_get(site_id):
    """
    This endpoint is used to get the contents of a website's "scanned" urls.
    """
    user_id = session["user_id"]
    
    # Filter operations - TODO
    # url = request.args.get('url')
    # type = request.args.get('type')
    # limit = request.args.get('limit')
    
    # Check that the site belongs to the user
    site = Site.query.filter_by(id=site_id, user_id=user_id).first()
    if not site:
        return jsonify({"error": "Site not found"}), 404
    
    collection_name = f"{site.name}_{site.user_id}"
    collection = chroma_client.get_collection(collection_name)
    
    return jsonify({"collection": collection.get()}), 200

@site.route('/<int:site_id>/similarity-search', methods=['POST'])
@login_required
def similarity_search(site_id):
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
    
    langchain_chroma = Chroma(
    client=chroma_client,
    collection_name=f"{site.name}_{site.user_id}",
    embedding_function=embeddings,
)
    
    docs = langchain_chroma.similarity_search(combined_data['query'])
    
    context = "\n".join([doc.page_content for doc in docs])
    
    return jsonify({"context": context}), 200

    

@site.route('/test', methods=['GET'])
@login_required_or_bearer_token
def test():
    return jsonify({"Hello": "World"}), 200