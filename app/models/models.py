from app import db 

class User(db.Model):
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
    
class Site(db.Model):
    """Site model for storing site related details"""
    
    __tablename__ = 'site'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False) # This is also the name of the collection.
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    # Define the relationship with ScannerMainUrl
    scanner_main_urls = db.relationship('ScannerMainUrl', backref='site', cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"Site('{self.name}', '{self.user_id}')"

class ScannerMainUrl(db.Model):
    """The main url that will be scanned"""
    
    __tablename__ = 'scanner_main_url'
    
    id = db.Column(db.Integer, primary_key=True)
    site_id = db.Column(db.Integer, db.ForeignKey('site.id'), nullable=False)
    url = db.Column(db.Text, unique=True, nullable=False)
    favicon_url = db.Column(db.Text, nullable=True)
    max_urls_allowed = db.Column(db.Integer, nullable=False, default=100) # Can be changed for "premium" users or something similar.
    
    # Define the relationship with ScannerFoundUrls
    found_urls = db.relationship('ScannerFoundUrls', backref='main_url', cascade="all, delete-orphan")
    
    def __repr__(self):
        return f'<ScannerMainUrl {self.url}>'
    
class ScannerFoundUrls(db.Model):
    """The found urls from the main url during scan"""
    
    __tablename__ = 'scanner_found_urls'
    
    id = db.Column(db.Integer, primary_key=True)
    main_id = db.Column(db.Integer, db.ForeignKey('scanner_main_url.id'), nullable=False)
    url = db.Column(db.Text, unique=True, nullable=False)
    
    def __repr__(self):
        return f'<ScannerFoundUrls {self.url}>'
