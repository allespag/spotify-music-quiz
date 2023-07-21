from pathlib import Path

import pytest

from musicquiz.spotify import SpotifyConfig, SpotifyConfigError
from unit.utils import get_data


def test_good_config():
    config_path = get_data("spotify_good_config.toml")
    config = SpotifyConfig.load(config_path)

    assert config.client_id == "some_good_client_id"
    assert config.client_secret == "some_good_client_secret"


@pytest.mark.parametrize(
    "config",
    [
        get_data("spotify_bad_config_no_client_secret.toml"),
        get_data("spotify_bad_config_no_table.toml"),
    ],
)
def test_wrong_config(config: Path):
    with pytest.raises(SpotifyConfigError):
        SpotifyConfig.load(config)
