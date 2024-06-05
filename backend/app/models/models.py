from app import db 
from sqlalchemy.orm import class_mapper
from app.utils.classify_url import classify_url, is_valid_url
class SerializableMixin:
    """Mixin for serializing objects to JSON"""
    def to_dict(self):
        return {c.key: getattr(self, c.key) for c in class_mapper(self.__class__).columns}

class User(SerializableMixin, db.Model):
    """User model for storing user related details"""
    
    __tablename__ = 'user'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=db.func.now())
    updated_at = db.Column(db.DateTime, nullable=False, default=db.func.now(), onupdate=db.func.now())
    max_sites = db.Column(db.Integer, nullable=False, default=1) # Can be changed on premium plans or something like that.
    
    sites = db.relationship('Site', backref='user', cascade="all, delete-orphan")

    def __repr__(self):
        return f"User('{self.username}', '{self.email}')"
    
class Site(SerializableMixin, db.Model):
    """Site model for storing site related details"""
    
    __tablename__ = 'site'
    
    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.DateTime, nullable=False, default=db.func.now())
    updated_at = db.Column(db.DateTime, nullable=False, default=db.func.now(), onupdate=db.func.now())
    name = db.Column(db.String(80), unique=True, nullable=False) # This is also the name of the collection.
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    favicon_url = db.Column(db.Text, nullable=True)
    
    # Define the relationship with SiteAddedSource
    added_sources = db.relationship('SiteAddedSource', backref='site', cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"Site('{self.name}', '{self.user_id}')"
    
class SiteAddedSource(SerializableMixin, db.Model):
    """The added sources of the site"""
    
    __tablename__ = 'site_source'
    
    id = db.Column(db.Integer, primary_key=True)
    site_id = db.Column(db.Integer, db.ForeignKey('site.id'), nullable=False)
    type = db.Column(db.String(80), nullable=False) # web, upload or input
    content_type = db.Column(db.String(80), nullable=True) # Only used for URLs
    source = db.Column(db.Text, unique=True, nullable=False) # Can be a URL, a name of a file or a user-input.
    created_at = db.Column(db.DateTime, nullable=False, default=db.func.now())
    updated_at = db.Column(db.DateTime, nullable=False, default=db.func.now(), onupdate=db.func.now())
    
    def __init__(self, site_id, type, source, created_at, updated_at):
        self.site_id = site_id
        self.type = type
        self.content_type = self.classify_and_set_type_if_url()
        self.source = source
        self.created_at = created_at
        self.updated_at = updated_at
        
    def classify_and_set_type_if_url(self):
        """
        Classifies the source (if its a URL) and sets its 'content_type' attribute.
        """
        if is_valid_url(self.source):
            self.content_type = classify_url(self.source)
            return self.content_type
        return None
    
    def __repr__(self):
        return f"SiteSource('{self.site_id}', '{self.source}')"