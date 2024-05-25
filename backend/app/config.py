import os
from datetime import timedelta
from redis import from_url

class Config:
    ENV = os.environ.get('FLASK_ENV')
    FLASK_DEBUG = os.environ.get('FLASK_DEBUG')
    ADMIN_AUTH_TOKEN = os.environ.get('ADMIN_AUTH_TOKEN')
    SECRET_KEY = os.environ.get('SECRET_KEY')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', SECRET_KEY)
    
    SQLALCHEMY_DATABASE_URI = os.environ.get('DB_URI')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    CACHE_TYPE = 'RedisCache'
    CACHE_DEFAULT_TIMEOUT = 300
    CACHE_REDIS_URL = 'redis://cache:6379/0'
    
    CELERY_BROKER_URL='redis://cache:6379/1'
    CELERY_RESULT_BACKEND='redis://cache:6379/1'
    
    PERMANENT_SESSION_LIFETIME = timedelta(days=7)
    SESSION_TYPE = 'redis'
    SESSION_PERMANENT = False
    SESSION_USE_SIGNER = True
    SESSION_REDIS = from_url('redis://cache:6379/2') # Expects redis object rather than url...