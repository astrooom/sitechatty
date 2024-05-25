FROM python:3.11.9-slim

ARG SSL_KEYFILE
ARG SSL_CERTFILE
ENV SSL_CERTFILE=${SSL_CERTFILE}
ENV SSL_KEYFILE=${SSL_KEYFILE}

ENV PYTHONUNBUFFERED 1

# Required for wheels.
RUN apt-get update && apt-get install -y libpq-dev build-essential

RUN mkdir -p /var/log/flask-src && touch /var/log/flask-src/flask-src.err.log && touch /var/log/flask-src/flask-src.out.log

# RUN mkdir -p /home/app && mkdir -p /opt/venv
WORKDIR /flask_app
COPY . .

# Create and activate virtual environment
ENV VIRTUAL_ENV=/opt/venv
RUN python -m venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"
RUN export FLASK_APP=run.py

RUN pip install --upgrade pip && \
    pip install -r ./app/requirements.txt

# Install playwright
RUN playwright install
RUN playwright install-deps