from app import db 
from sqlalchemy.orm import class_mapper
from app.utils.classify_url import classify_url
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
    max_urls_allowed = db.Column(db.Integer, nullable=False, default=100) # Can be changed for "premium" users or something similar.
    
    added_sources = db.relationship('SiteAddedSources', backref='site', cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"Site('{self.name}', '{self.user_id}')"
    
class SiteAddedSources(SerializableMixin, db.Model):
    """The added sources for the site"""
    
    __tablename__ = 'site_added_sources'
    
    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.DateTime, nullable=False, default=db.func.now())
    updated_at = db.Column(db.DateTime, nullable=False, default=db.func.now(), onupdate=db.func.now())
    site_id = db.Column(db.Integer, db.ForeignKey('site.id'), nullable=False)
    source = db.Column(db.String(80), unique=True, nullable=False)
    source_type = db.Column(db.String(80), nullable=False)
    type = db.Column(db.String(80), nullable=True)
    
    def __init__(self, site_id, source, source_type):
        self.site_id = site_id
        self.source = source
        self.source_type = source_type # The type of the source (i.e "input" or "webpage")
        self.type = self.classify_and_set_type() # Only valid for webpages. Guesses a category based on the URL path.
        
    def classify_and_set_type(self):
        """
        Classifies the URL and sets the 'type' attribute.
        """
        self.type = classify_url(self.source)
        return self.type
    
    def __repr__(self):
        return f'<SiteAddedSources {self.source}>'
    
# class SiteIgnoredVectorDbSource(SerializableMixin, db.Model):
#     """
#     The ignored vector db sources for the site.
#     This is only used for raw input text because
#     These, unlike urls, go directly into the vector db.
#     So ignoring them will not "Remove" them but instead make them not included in any queries.
#     """

#     __tablename__ = 'site_ignored_vector_db_source'
    
#     id = db.Column(db.Integer, primary_key=True)
#     site_id = db.Column(db.Integer, db.ForeignKey('site.id'), nullable=False)
#     source = db.Column(db.String(80), unique=True, nullable=False)
    
#     def __repr__(self):
#         return f'<SiteIgnoredVectorDbSource {self.source}>'
    