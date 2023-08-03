import uuid

import pytest

from musicquiz import create_app
from musicquiz.room import RoomFactory, RoomFactoryException
from unit.utils import get_data


@pytest.fixture
def app():
    config_path = get_data("app_config.toml").resolve()
    return create_app(config_path)


@pytest.fixture
def some_room_id() -> str:
    return str(uuid.uuid4())


@pytest.fixture
def room_factory():
    return RoomFactory()


def test_create_room(room_factory: RoomFactory, some_room_id: str):
    room = room_factory.create_room(some_room_id)

    assert len(room_factory.rooms) == 1
    assert room_factory.rooms[some_room_id] == room

    with pytest.raises(RoomFactoryException):
        room_factory.create_room(some_room_id)


def test_get_room(room_factory: RoomFactory, some_room_id: str):
    room = room_factory.create_room(some_room_id)
    room_received = room_factory.get_room(some_room_id)

    assert room == room_received
    assert room_factory.get_room("this room does not exist!") is None


@pytest.mark.skip
def test_join_room():
    raise NotImplementedError


@pytest.mark.skip
def test_leave_room():
    raise NotImplementedError
