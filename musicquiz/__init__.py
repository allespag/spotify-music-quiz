import os
import tomllib
from pathlib import Path

import spotipy
from flask import Flask, redirect, render_template, request, session
from flask_socketio import SocketIO
from werkzeug import exceptions

from . import spotify

socketio = SocketIO()


def create_app(config_path: Path) -> Flask:
    app = Flask(__name__)
    app.config.from_file(str(config_path), load=tomllib.load, text=False)

    spotify_config = spotify.SpotifyConfig.load(config_path)

    client = None

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

    # TODO: create a `404.html` template with a fun gif !
    @app.errorhandler(exceptions.NotFound)
    def not_found(error: exceptions.NotFound):
        return redirect("/")

    socketio.init_app(app)

    return app
