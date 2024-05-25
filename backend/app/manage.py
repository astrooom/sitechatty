from app import create_app, db
from flask.cli import FlaskGroup

def create_cli_app():
    app, _ = create_app()
    return app

cli = FlaskGroup(create_app=create_cli_app)

if __name__ == '__main__':
    cli()
