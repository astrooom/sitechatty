from wtforms import StringField, PasswordField, Form
from wtforms.validators import DataRequired, Email, Length, Optional, ValidationError
from app.models.models import User

class RegisterForm(Form):
    username = StringField('username', validators=[DataRequired(), Length(min=3, max=20)])
    email = StringField('email', validators=[DataRequired(), Email()])
    password = PasswordField('password', validators=[DataRequired(), Length(min=6, max=32)])

    def validate_email(self, email):
        if User.query.filter_by(email=email.data).first():
            raise ValidationError('Email address already in use')

    def validate_username(self, username):
        if User.query.filter_by(username=username.data).first():
            raise ValidationError('Username already in use')

class LoginForm(Form):
    email = StringField('email', validators=[DataRequired(), Email()])
    password = PasswordField('password', validators=[DataRequired(), Length(min=6, max=32)])
    
class UpdateForm(Form):
    username = StringField('username', validators=[Optional(), Length(min=3, max=20)])
    email = StringField('email', validators=[Optional(), Email()])
    old_password = PasswordField('old_password', validators=[Optional(), Length(min=6, max=32)])
    password = PasswordField('password', validators=[Optional(), Length(min=6, max=32)])