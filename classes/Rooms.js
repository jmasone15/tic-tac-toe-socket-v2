import { generateLogMessage as log } from '../utils/logMessage.js';

class Player {
	constructor(socket, symbol) {
		this.socket = socket;
		this.symbol = symbol;
	}

	get ready() {
		return this.socket && this.socket.readyState === this.socket.OPEN;
	}

	message(type, roomCode, payload) {
		this.socket.send(JSON.stringify({ type, roomCode, payload }));
		return;
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

	sendSocketHome(socket, message) {
		socket.send(
			JSON.stringify({
				type: 'home',
				payload: { message }
			})
		);
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

				log({ type: 'Rooms', message: `Room ${roomCode} has been created.` });

				// Add player to new room
				this.joinRoom({ room, roomCode, socket });
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

			// Set socket with roomCode to identify on disconnect
			socket.roomCode = roomCode;

			// Notify user of success
			socket.send(
				JSON.stringify({
					type: 'joined-room',
					roomCode,
					payload: {
						symbol: player.symbol,
						gameStart: targetRoom.full
					}
				})
			);

			log({
				type: `Room ${roomCode}`,
				message: `Player [${player.symbol}] has joined the room.`
			});
		} else {
			this.sendSocketHome(socket, 'Could not join room...');
		}

		return;
	};

	leaveRoom = (socket) => {
		if (!socket.roomCode) {
			return;
		}

		const room = this.findRoom(socket.roomCode);
		const playerIdx = room.players.findIndex((p) => p.socket === socket);
		const leavingPlayerSymbol = room.players[playerIdx].symbol;

		if (room.full) {
			// Remove player and update current player symbol
			room.players.splice(playerIdx, 1);
			room.players[0].symbol = 'X';

			log({
				type: `Room ${socket.roomCode}`,
				message: `Player [${leavingPlayerSymbol}] has left the room.`
			});
		} else {
			this.rooms.delete(socket.roomCode);
			log({
				type: `Room ${socket.roomCode}`,
				message: 'Room has been deleted.'
			});
		}
	};
}
