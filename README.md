# Spotify Music Quiz

## About

`Spotify Music Quiz` was largely inspired by [Deezer's music quiz](https://www.deezer.com/explore/fr/features/music-quiz/), on which Grégoire used to beat me when we played.

The idea was above all to have a free zone of expression where I could discover new things (including `Flask` and the `Spotify API`) and not particularly do anything technically impressive.

Also, I used [p5.js](https://p5js.org/) to create the *animations*.

## How to run the app ?

### Prerequisites

You have `python3.11` and [you're able to create a virtual env](https://docs.python.org/3/library/venv.html)

### Setup

```shell
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

```shell
mkdir configs
cd configs
touch development_config.toml
```

Create an spotify app [here](https://developer.spotify.com/) and then fill the `development_config.toml`

```toml
SECRET_KEY = "Some Flask secret key"

[spotify]

client_id = "Your client_id"
client_secret = "Your client_secret"
redirect_uri = "Your redirect uri"

```

### Usage

```shell
(venv) $> python run.py
```

## Some TODOs

- [ ] Tell the user that the room already exists
- [ ] Create a `404.html` template with a fun gif !
- [ ] Add Multiplayer
- [ ] Add more tests
- [ ] Add Volume slider
- [ ] Add favicon
- [ ] Add Replay button
- [ ] Deploy