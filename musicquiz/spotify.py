from __future__ import annotations

import tomllib
from dataclasses import dataclass
from pathlib import Path


class SpotifyConfigError(Exception):
    pass


@dataclass(frozen=True)
class SpotifyConfig:
    """
    Spotify configuration information that can be found in the Spotify dashboard.
    """

    client_id: str
    client_secret: str
    redirect_uri: str

    @classmethod
    def load(cls, config_path: Path | str) -> SpotifyConfig:
        if isinstance(config_path, str):
            config_path = Path(config_path)

        with config_path.open("rb") as f:
            config = tomllib.load(f)

        try:
            client_id = config["spotify"]["client_id"]
            client_secret = config["spotify"]["client_secret"]
            redirect_uri = config["spotify"]["redirect_uri"]
        except KeyError as e:
            raise SpotifyConfigError(
                f"{config_path} does not seem to define a correct Spotify configuration. {e.args} is/are missing."
            )

        return cls(client_id, client_secret, redirect_uri)
