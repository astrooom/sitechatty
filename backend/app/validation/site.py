from wtforms import Form, StringField, IntegerField, FieldList, BooleanField
from wtforms.validators import Length, DataRequired, ValidationError, Regexp, URL as WTFormsURL, NumberRange
from app.models.models import Site
import re
from urllib.parse import urlparse

LONGFORM_TEXT_MAX = 65_535

def max_list_length(max_length):
    def _max_list_length(form, field):
        if len(field.data) > max_length:
            raise ValidationError(f'List must not contain more than {max_length} items.')
    return _max_list_length

# Define a custom validator
def validate_alphanum_underscore(form, field):
    if not re.match("^[a-zA-Z0-9_]*$", field.data):
        raise ValidationError(f"{field.label.text} must contain only alphanumerical characters and underscores")

def URLWithScheme(message=None):
    if message is None:
        message = 'URL must contain a valid scheme (http:// or https://)'

    def _URLWithScheme(form, field):
        url = field.data
        parsed_url = urlparse(url)
        if not parsed_url.scheme:
            raise ValidationError(message)

    return _URLWithScheme

def BaseURL(message=None):
    if message is None:
        message = 'The URL must be a base URL (e.g., http://example.com)'

    def _BaseURL(form, field):
        url = field.data
        parsed_url = urlparse(url)
        if parsed_url.path not in ('', '/'):
            raise ValidationError(message)

    return _BaseURL

class CreateForm(Form):
    name = StringField('name', validators=[
        DataRequired(),
        Length(min=1, max=80),
        Regexp(r'^[a-zA-Z0-9]+$', message="Name must contain only letters and numbers.")
    ])

class AddScanForm(Form):
    site_id = IntegerField('site_id', validators=[DataRequired()])
    max_depth = IntegerField('max_depth', default=2, validators=[
        DataRequired(), 
        NumberRange(min=1, max=4, message='Max depth must be between 1 and 4')
    ])
    url = StringField('url', validators=[
        DataRequired(), 
        Length(min=4, max=2083), 
        BaseURL()  # Ensure the URL is a base URL
    ])
    
    def validate_site_id(self, site_id):
        if not Site.query.filter_by(id=site_id.data).first():
            raise ValidationError('Site not found')

class CrawlerCrawlForm(Form):
    site_id = IntegerField('site_id', validators=[DataRequired()])
    urls = FieldList(StringField('url'), validators=[max_list_length(999)]) # optionsl if all_urls is True
    all_urls = BooleanField('all_urls', default=False)
    delete_first = BooleanField('delete_first', default=False)
    do_cleanup = BooleanField('do_cleanup', default=False)
        
    def validate_site_id(self, site_id):
        if not Site.query.filter_by(id=site_id.data).first():
            raise ValidationError('Site not found')

    def validate(self):
        if not super().validate():
            return False

        if not self.all_urls.data and not self.urls.data:
            self.urls.errors.append('Either provide URLs or check the "all_urls" option.')
            return False

        return True
    
class AddTextInputForm(Form):
    title = StringField('title', validators=[DataRequired(), Length(min=4, max=80), validate_alphanum_underscore])
    content = StringField('content', validators=[DataRequired(), Length(min=4, max=LONGFORM_TEXT_MAX)])

class UpdateTextInputForm(Form):
    current_title = StringField('current_title', validators=[DataRequired(), Length(min=4, max=80), validate_alphanum_underscore])
    title = StringField('title', validators=[DataRequired(), Length(min=4, max=80), validate_alphanum_underscore])
    content = StringField('content', validators=[DataRequired(), Length(min=4, max=LONGFORM_TEXT_MAX)])
    
class AddAddedWebpagesForm(Form):
    site_id = IntegerField('site_id', validators=[DataRequired()])
    url = StringField('url', validators=[
        DataRequired(), 
        Length(min=4, max=2083), 
        WTFormsURL(),  # This checks for general URL validity
        URLWithScheme()  # This ensures the URL contains a scheme
    ])
    
    def validate_site_id(self, site_id):
        if not Site.query.filter_by(id=site_id.data).first():
            raise ValidationError('Site not found')