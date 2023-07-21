import os
from pathlib import Path

import spotipy
from flask import Flask, redirect, render_template, request, session
from werkzeug import exceptions

from . import spotify

CONFIGS_ROOT = Path("configs")


def create_app() -> Flask:
    app = Flask(__name__)

    if app.debug:
        app.config.update(
            SECRET_KEY=os.urandom(64),
        )
    else:
        app.config.from_pyfile(str(CONFIGS_ROOT / "production_config.py"))

    spotify_config = spotify.SpotifyConfig.load(CONFIGS_ROOT / "spotify.toml")

    @app.route("/")
    def index():
        return render_template("index.html")

    # https://github.com/spotipy-dev/spotipy/blob/master/examples/app.py
    @app.route("/login")
    def login():
        cache_handler = spotipy.cache_handler.FlaskSessionCacheHandler(session)
        auth_manager = spotipy.oauth2.SpotifyOAuth(
            spotify_config.client_id,
            spotify_config.client_secret,
            spotify_config.redirect_uri,
            cache_handler=cache_handler,
            show_dialog=True,
        )

        # Already logged in
        if request.args.get("code"):
            auth_manager.get_access_token(request.args.get("code"))
            return redirect("/")

        # Redirect to Spotify authentication page
        if not auth_manager.validate_token(cache_handler.get_cached_token()):
            auth_url = auth_manager.get_authorize_url()
            return redirect(auth_url)

        # Logged
        return redirect("/")

    @app.route("/logout")
    def logout():
        session.pop("token_info", None)
        return redirect("/")

    # TODO: create a `404.html` template with a fun gif !
    @app.errorhandler(exceptions.NotFound)
    def not_found(error: exceptions.NotFound):
        return redirect("/")

    return app
