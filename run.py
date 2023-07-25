from musicquiz import create_app, socketio
from musicquiz.utils import get_configs_store

# TODO: CLI to run in debug or in prod
if __name__ == "__main__":
    config = get_configs_store() / "development_config.toml"
    app = create_app(config)
    socketio.run(app, port=8008, debug=True)
