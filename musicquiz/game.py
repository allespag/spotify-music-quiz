from __future__ import annotations

import typing as tp
from random import choices

import spotipy
from pydantic import BaseModel


class Track(BaseModel):
    title: str
    artists: list[str]
    preview_url: str | None
    id_: str

    @classmethod
    def from_spotify_track(cls, spotify_track: dict[str, tp.Any]) -> Track:
        title = spotify_track["name"]
        artists = [artist["name"] for artist in spotify_track["artists"]]
        preview_url = spotify_track["preview_url"]
        id_ = spotify_track["id"]

        return cls(
            title=title,
            artists=artists,
            preview_url=preview_url,
            id_=id_,
        )


def setup(client: spotipy.Spotify) -> str:
    class ItemMCQ(BaseModel):
        answer: Track
        choices: list[Track]

        @classmethod
        def from_spotify_track(cls, spotify_track: dict[str, tp.Any]) -> ItemMCQ:
            answer = Track.from_spotify_track(spotify_track)

            recommendations = client.recommendations(
                seed_tracks=[answer.id_],
                limit=MCQ.CHOICES_COUNT - 1,
            )
            assert recommendations is not None
            choices = [
                Track.from_spotify_track(track) for track in recommendations["tracks"]
            ]

            return cls(answer=answer, choices=choices)

    class MCQ(BaseModel):
        items: list[ItemMCQ]
        CHOICES_COUNT: tp.ClassVar[int] = 4
        LENGTH: tp.ClassVar[int] = 10

        @classmethod
        def from_spotify_playlist_id(cls, spotify_playlist_id: str) -> MCQ:
            items = []

            # (1) Get all tracks
            tracks = client.playlist_tracks(spotify_playlist_id)
            assert tracks is not None
            tracks = tracks["items"]
            # (2) Ensure that we have a preview url
            tracks = [
                track["track"] for track in tracks if track["track"]["preview_url"]
            ]
            for track in choices(tracks, k=MCQ.LENGTH):
                item = ItemMCQ.from_spotify_track(track)
                items.append(item)

            return cls(items=items)

    client_id = client.me()["id"]
    # TODO: find a better way to choose a playlist
    spotify_playlist_id = client.user_playlists(client_id)["items"][8]["id"]

    mcq = MCQ.from_spotify_playlist_id(spotify_playlist_id)

    return mcq.model_dump_json()
