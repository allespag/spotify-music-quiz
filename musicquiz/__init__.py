import tomllib
from functools import wraps
from pathlib import Path

import spotipy
from flask import Flask, redirect, render_template, request, session, url_for
from flask_socketio import SocketIO
from werkzeug import exceptions

from . import spotify
from .events import init_socketio

socketio = SocketIO()


def create_app(config_path: Path) -> Flask:
    app = Flask(__name__)
    app.config.from_file(str(config_path), load=tomllib.load, text=False)

    spotify_config = spotify.SpotifyConfig.load(config_path)

    client = None

    def login_required(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if client is None:
                return redirect(url_for("login", next=request.url))
            return f(*args, **kwargs)

        return decorated_function

    @app.route("/")
    def index():
        return render_template("index.html", client=client)

    @app.route("/login")
    def login():
        cache_handler = spotipy.cache_handler.FlaskSessionCacheHandler(session)
        auth_manager = spotipy.oauth2.SpotifyOAuth(
            spotify_config.client_id,
            spotify_config.client_secret,
            spotify_config.redirect_uri,
            # scope,
            show_dialog=True,
            cache_handler=cache_handler,
        )

        nonlocal client

        # Already logged in
        if request.args.get("code"):
            auth_manager.get_access_token(request.args.get("code"))
            client = spotipy.Spotify(auth_manager=auth_manager)
            return redirect("/")

        # Redirect to Spotify authentication page
        if not auth_manager.validate_token(cache_handler.get_cached_token()):
            auth_url = auth_manager.get_authorize_url()
            return redirect(auth_url)

        # Logged
        client = spotipy.Spotify(auth_manager=auth_manager)
        return redirect("/")

    @app.route("/logout")
    def logout():
        nonlocal client
        client = None

        session.pop("token_info", None)

        return redirect("/")

    @app.route("/room/<string:id_>")
    @login_required
    def room(id_: str):
        raise NotImplementedError

    @app.route("/create_room")
    @login_required
    def create_room():
        return render_template("create_room.html")

    @app.route("/join_room")
    @login_required
    def join_room():
        raise NotImplementedError

    @app.route("/about")
    def about():
        raise NotImplementedError

    # TODO: create a `404.html` template with a fun gif !
    @app.errorhandler(exceptions.NotFound)
    def not_found(error: exceptions.NotFound):
        return redirect("/")

    init_socketio(socketio)
    socketio.init_app(app)

    return app
