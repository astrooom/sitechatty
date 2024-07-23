from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_caching import Cache
from flask_migrate import Migrate
from flask_session import Session
from .config import Config
from .celery_worker import make_celery
from app.utils.validation import FormValidationError
import chromadb
from chromadb.config import Settings
from flask_jwt_extended import (
    JWTManager
)
from flask_socketio import SocketIO
import redis
# from alembic import command
# from alembic.config import Config as AlembicConfig
# import os

db = SQLAlchemy()
migrate = Migrate()

# Use Redis db 0 as the cache. Redis db 1 is used for celery.
# This cache is currently used for:
# - ratelimiting
cache = Cache()

sess = Session()

jwt = JWTManager()

celery = None

redis_client = redis.from_url(Config.MISC_REDIS_URL) # misc redis client for everything thats not cache or directly celery-related.

socketio = SocketIO()

chroma_client = chromadb.HttpClient(host="chromadb", port=8000, settings=Settings(allow_reset=False, anonymized_telemetry=False))

# def autogenerate_and_apply_migrations(app):
#     """Automatically generates and applies migrations."""
#     with app.app_context():
#         alembic_cfg = AlembicConfig(os.path.join(app.root_path, 'migrations', 'alembic.ini'))
#         alembic_cfg.set_main_option('script_location', 'migrations')
#         command.revision(alembic_cfg, autogenerate=True, message="Auto migration")
#         command.upgrade(alembic_cfg, 'head')

def create_app():
    global celery
    app = Flask(__name__)
    # app.config.from_object('config.Config')
    app.config.from_object(Config)

    db.init_app(app)
    cache.init_app(app)
    sess.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    socketio.init_app(app, cors_allowed_origins="*")
    celery = make_celery(app)

    with app.app_context():
        # Import parts of our application
        from .routes.views import main
        from .routes.site import site
        from .routes.auth import auth
        from .routes.task import task
        from .routes.landing import landing
        
        app.register_blueprint(main, url_prefix='/api')
        app.register_blueprint(site, url_prefix='/api/site')
        app.register_blueprint(auth, url_prefix='/api/auth')
        app.register_blueprint(task, url_prefix='/api/task')
        app.register_blueprint(landing, url_prefix='/api/landing')

        # Create database tables for our data models
        db.create_all()
        
    @app.errorhandler(FormValidationError)
    def handle_form_validation_error(error):
        """Global error handler for form validation errors from WTForms."""
        response = jsonify({'error': error.errors})
        response.status_code = 400
        return response        

        # Automatically generate and apply migrations (development only)
        # if app.config['ENV'] == 'development':
        #     autogenerate_and_apply_migrations(app)

    return app, celery