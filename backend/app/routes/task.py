from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import celery, redis_client
from app.utils.celery import test
import json

task = Blueprint('task', __name__)

i = celery.control.inspect(['celery@host'])

def get_user_tasks(user_id: int):
    task_keys = redis_client.keys(f"tasks:{user_id}:*")
    tasks = []
    for key in task_keys:
        task_data = redis_client.get(key)
        if task_data:
            task_id = key.decode('utf-8').split(':')[-1]
            task_info = json.loads(task_data)
            tasks.append({**task_info, 'task_id': task_id})
    return tasks

def get_tasks(user_id: int, task_ids: list):
    tasks = []
    for task_id in task_ids:
        task_key = f"tasks:{user_id}:{task_id}"
        task_data = redis_client.get(task_key)
        if task_data:
            task_info = json.loads(task_data)
            tasks.append({**task_info, 'task_id': task_id})
    return tasks

def task_set_notified(user_id: int, task_id: str):
    task_key = f"tasks:{user_id}:{task_id}"
    task_data = redis_client.get(task_key)
    
    if task_data:
        task_dict = json.loads(task_data)
        task_dict['has_notified'] = True
        redis_client.set(task_key, json.dumps(task_dict))
        return True
    return False

def clear_tasks(user_id: int, task_ids: list):
    for task_id in task_ids:
        task_key = f"tasks:{user_id}:{task_id}"
        redis_client.delete(task_key)   


@task.route('/list', methods=['GET'])
@jwt_required()
def list_tasks():
    user_id = get_jwt_identity()
    return jsonify(get_user_tasks(user_id)), 200

@task.route('/status', methods=['POST'])
@jwt_required()
def task_status():
    user_id = get_jwt_identity()
    task_ids = request.json.get('task_ids')
    if not task_ids:
        return jsonify({'error': 'No task IDs provided'}), 400
    return jsonify(get_tasks(user_id, task_ids)), 200

@task.route('/clear', methods=['POST'])
@jwt_required()
def clear_tasks_():
    user_id = get_jwt_identity()
    task_ids = request.json.get('task_ids')
    if not task_ids:
        return jsonify({'error': 'No task IDs provided'}), 400
    
    clear_tasks(user_id, task_ids)
    return jsonify({}), 200

@task.route('/<uuid:task_id>/set-notified', methods=['POST'])
@jwt_required()
def set_notified(task_id):
    user_id = get_jwt_identity()
    notified = task_set_notified(user_id, task_id)
    return jsonify({'has_notified': notified}), 200


@task.route('/test', methods=['POST'])
@jwt_required()
def test_task():
    user_id = get_jwt_identity()
    delay = request.json.get('delay')
    if not delay:
        return jsonify({'error': 'No delay provided'}), 400
    
    task = test.apply_async(
        args=[int(delay)], kwargs={"user_id": user_id, "display_name": "Test task"}
    )
    
    return jsonify({'task_id': task.id}), 200
