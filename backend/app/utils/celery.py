from datetime import datetime, timedelta, timezone
import json

from app import celery, db, chroma_client, redis_client
from celery.signals import task_prerun, task_postrun, task_failure
from app.models.models import Site
from app.utils.embeddings import embeddings

from .scanner import Scanner
from .crawler import Crawler


# Signals
def get_task_display_name(kwargs, task_name):
    # Get the display name from kwargs, default to task function name if not provided
    return kwargs.get('display_name', task_name)
@task_prerun.connect
def task_started_handler(sender=None, task_id=None, task=None, args=None, kwargs=None, **extra):
    user_id = kwargs.get('user_id')
    if user_id is not None:
        task_display_name = get_task_display_name(kwargs, sender.name)
        task_key = f"tasks:{user_id}:{task_id}"
        redis_client.set(task_key, json.dumps({
            'name': task_display_name,
            'status': 'started',
            'start_time': datetime.now(timezone.utc).isoformat(),
        }))
        
@task_postrun.connect
def task_completed_handler(sender=None, task_id=None, task=None, args=None, kwargs=None, retval=None, **extra):
    user_id = kwargs.get('user_id')
    if user_id is not None:
        task_key = f"tasks:{user_id}:{task_id}"
        redis_client.set(task_key, json.dumps({
            **json.loads(redis_client.get(task_key)),
            'status': 'completed',
            'result': retval,
        }))
        redis_client.expire(task_key, timedelta(days=2)) # Expire completed task after 2 days

@task_failure.connect
def task_failure_handler(sender=None, task_id=None, task=None, args=None, kwargs=None, exc=None, **extra):
    user_id = kwargs.get('user_id')
    if user_id is not None:
        task_key = f"tasks:{user_id}:{task_id}"
        redis_client.set(task_key, json.dumps({
            **json.loads(redis_client.get(task_key)),
            'status': 'failed',
            'error': str(exc),
        }))
        redis_client.expire(task_key, timedelta(days=2)) # Expire failed task after 2 days  
        
# Tasks
@celery.task(bind=True)
def scan_url(self, base_url, site_id, max_depth, **kwargs):
    scanner = Scanner(base_url, max_depth, db_site_id=site_id, db_session=db.session) # Scans paths recursively from a base url and puts them in the DB.
    scanner.start_scanning()
    
@celery.task(bind=True)
def crawl_urls(self, site_id: int, urls: list, delete_first: bool = False, do_cleanup: bool = False, **kwargs):
    # Get the site from the DB
    site = Site.query.filter_by(id=site_id).first()
    if not site:
        raise Exception("Site not found")
    
    # Name the collection <site_name>_<user_id> to avoid overwriting same site names accross users.
    collection_name = f"{site.name}_{site.user_id}"
    
    if delete_first:
        chroma_client.delete_collection(collection_name)

    collection = chroma_client.get_or_create_collection(collection_name, embedding_function=embeddings)
    
    crawler = Crawler(collection)
    crawler.process_urls(urls, do_cleanup=do_cleanup)
    return "Completed scan."
    
@celery.task(bind=True)
def test(self, delay: int, **kwargs):
    # Run a test task for delay seconds
    import time
    time.sleep(delay)
    return "Test task completed"