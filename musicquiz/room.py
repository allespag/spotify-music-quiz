from flask_socketio import join_room, leave_room


class RoomFactoryException(Exception):
    pass


class Room:
    def __init__(self, room_id: str) -> None:
        self.id_ = room_id
        self.clients = set()

    def join(self, client):
        self.clients.add(client)
        join_room(self.id_)

    def leave(self, client):
        self.clients.remove(client)
        leave_room(client)


class RoomFactory:
    def __init__(self) -> None:
        self.rooms = {}

    def create_room(self, room_id: str) -> Room:
        if self.room_exists(room_id):
            raise RoomFactoryException(f"{room_id} already exists")
        else:
            room = Room(room_id)
            self.rooms[room_id] = room
            return room

    def get_room(self, room_id: str) -> Room | None:
        return self.rooms.get(room_id, None)

    def room_exists(self, room_id: str) -> bool:
        return room_id in self.rooms
