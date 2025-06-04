import { generateLogMessage as log } from '../utils/logMessage.js';

class Player {
	constructor(socket, symbol) {
		this.socket = socket;
		this.symbol = symbol;
	}

	get ready() {
		return this.socket && this.socket.readyState === this.socket.OPEN;
	}
}

class Room {
	constructor(roomCode) {
		this.roomCode = roomCode;
		this.players = [];
		this.gameActive = false;
	}

	get full() {
		return this.players.length === 2;
	}
}

export default class Rooms {
	constructor() {
		this.rooms = new Map();
	}

	findRoom = (roomCode) => {
		return this.rooms.get(roomCode);
	};

	createRoom = (socket) => {
		let roomCode;

		while (true) {
			// e.g. 'A1B2C'
			roomCode = Math.random().toString(36).substring(2, 7).toUpperCase();

			// If roomCode is unique...
			if (!this.findRoom(roomCode)) {
				// Create room and app to rooms map
				const room = new Room(roomCode);
				this.rooms.set(roomCode, room);

				// Add player to new room
				this.joinRoom({ room, socket });

				log({ type: 'Room', message: `Room ${roomCode} has been created.` });
				return;
			}
		}
	};

	joinRoom = ({ room, roomCode, socket }) => {
		const targetRoom = room ?? this.findRoom(roomCode);

		if (targetRoom && !targetRoom.full) {
			const player = new Player(
				socket,
				targetRoom.players.length === 0 ? 'X' : 'O'
			);
			targetRoom.players.push(player);

			log({
				type: 'Room',
				message: `Player [${player.symbol}] has joined Room [${targetRoom.roomCode}]`
			});
		}

		return;
	};

	roomsLog = (message) => {
		const now = new Date();
		const timestamp = `[${now
			.toISOString()
			.replace('T', ' ')
			.substring(0, 19)}]`;

		console.log(`${timestamp} ${message}`);
	};
}
