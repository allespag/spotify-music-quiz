import tomllib
import typing as tp
from functools import wraps
from pathlib import Path

import markdown
import spotipy
from flask import Flask, abort, redirect, render_template, request, session, url_for
from flask_socketio import SocketIO
from werkzeug import exceptions

from . import spotify
from .game import setup
from .room import RoomFactory, RoomFactoryException

socketio = SocketIO()


def create_app(config_path: Path) -> Flask:
    app = Flask(__name__)
    app.config.from_file(str(config_path), load=tomllib.load, text=False)

    spotify_config = spotify.SpotifyConfig.load(config_path)

    client = None

    room_factory = RoomFactory()

    def login_required(f: tp.Callable):
        @wraps(f)
        def decorated_function(*args: tp.Any, **kwargs: tp.Any):
            if client is None:
                return redirect(url_for("login", next=request.url))
            return f(*args, **kwargs)

        return decorated_function

    @socketio.event
    def room_joined(data: dict):
        room_id = data["room_id"]
        r = room_factory.get_room(room_id)

        if r is None:
            raise NotImplementedError

        r.join(client)

    @socketio.event
    def room_created(data: dict):
        room_id = data["room_id"]
        try:
            r = room_factory.create_room(room_id)
        except RoomFactoryException as e:
            # TODO: tell the user that the room already exists
            raise e
        else:
            r.join(client)
            socketio.emit("redirect", {"url": url_for("room", room_id=room_id)})

    @app.route("/")
    def index():
        return render_template("index.html", client=client)

    @app.route("/login")
    def login():
        scope = "playlist-read-private"
        cache_handler = spotipy.cache_handler.FlaskSessionCacheHandler(session)
        auth_manager = spotipy.oauth2.SpotifyOAuth(
            spotify_config.client_id,
            spotify_config.client_secret,
            spotify_config.redirect_uri,
            scope=scope,
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

    @app.route("/room/<string:room_id>")
    @login_required
    def room(room_id: str):
        r = room_factory.get_room(room_id)

        if r is None:
            abort(404)

        assert client is not None
        mcq = setup(client)
        return render_template("game.html", client=client, mcq=mcq)

    @app.route("/create_room")
    @login_required
    def create_room():
        return render_template("create_room.html", client=client)

    @app.route("/about")
    def about():
        if app.static_folder is None:
            abort(404)

        about_md = Path(app.static_folder) / "media" / "about.md"
        about_html = markdown.markdown(about_md.read_text(encoding="utf-8"))

        return render_template("about.html", client=client, about=about_html)

    # TODO: create a `404.html` template with a fun gif !
    @app.errorhandler(exceptions.NotFound)
    def not_found(error: exceptions.NotFound):
        return redirect("/")

    socketio.init_app(app)

    return app
