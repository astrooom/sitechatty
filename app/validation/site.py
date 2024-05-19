from wtforms import Form, StringField, IntegerField, FieldList, BooleanField
from wtforms.validators import Length, DataRequired, ValidationError, Regexp
from app.models.models import Site


def max_list_length(max_length):
    def _max_list_length(form, field):
        if len(field.data) > max_length:
            raise ValidationError(f'List must not contain more than {max_length} items.')
    return _max_list_length

class CreateForm(Form):
    name = StringField('name', validators=[
        DataRequired(),
        Length(min=1, max=80),
        Regexp(r'^[a-zA-Z0-9]+$', message="Name must contain only letters and numbers.")
    ])

class ScannerScanForm(Form):
    site_id = IntegerField('site_id', validators=[DataRequired()])
    base_url = StringField('base_url', validators=[DataRequired(), Length(min=1, max=2083)])
    
    def validate_site_id(self, site_id):
        if not Site.query.filter_by(id=site_id.data).first():
            raise ValidationError('Site not found')

class CrawlerCrawlForm(Form):
    site_id = IntegerField('site_id', validators=[DataRequired()])
    urls = FieldList(StringField('url'), validators=[max_list_length(999)]) # optionsl if all_urls is True
    all_urls = BooleanField('all_urls', default=False)

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