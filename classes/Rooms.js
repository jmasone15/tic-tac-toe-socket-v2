class Room {
	constructor(roomCode) {
		this.roomCode = roomCode;
		this.players = [];
		this.gameActive = false;
	}
}

export default class Rooms {
	constructor() {
		this.rooms = new Map();
	}

	createRoom() {
		let roomCode;

		while (true) {
			roomCode = this.generateRoomCode();

			// If roomCode is unique...
			if (!this.rooms.has(roomCode)) {
				// Create room and app to rooms map
				const room = new Room(roomCode);
				this.rooms.set(roomCode, room);

				return room;
			}
		}
	}

	roomsLog(message) {
		const now = new Date();
		const timestamp = `[${now
			.toISOString()
			.replace('T', ' ')
			.substring(0, 19)}]`;

		console.log(`${timestamp} ${message}`);
	}
}
