from flask import Blueprint, jsonify, request
from app.utils.validation import validate_form
from app.validation.site import TestScanForm
# from app.utils.celery import landing_crawl_urls
# from app.utils.vector import get_collection
from app.utils.scraping import scrape_url, extract_content
from app.utils.ai import get_landing_questions

landing = Blueprint('landing', __name__)

# Public Routes
@landing.route('/scan', methods=['POST'])
def landing_scan():
    """
    This endpoint is used on the landing page to:
    1. Grab the contents of the user-input URL
    2. Use AI to generate 3 relevant questions based on the content
    3. Return the questions to the user
    
    This endpoint does not require authentication as its ran before the user signs up.
    """
    form = validate_form(TestScanForm, request.get_json(silent=True))
    
    url = form.url.data
    
    client_ip = request.headers.get('Real-Client-Ip')

    #? Add some sort of rate-limiting by ip here..

    # When the task completes, grab the content and let AI generate a couple questions based on it.
    html = scrape_url(url)
    title, date, trimmed_content = extract_content(html=html)
    
    # If the scraped content is less than 3000 characters, return an error
    if len(trimmed_content) < 1000:
        return jsonify({"error": "The content of this page is too short. Try another page."}), 400
    
    # Reduce length of content to only the first 3000
    trimmed_content = trimmed_content[:3000]
    
    questions = get_landing_questions(contents=trimmed_content)
    
    return jsonify(questions), 200