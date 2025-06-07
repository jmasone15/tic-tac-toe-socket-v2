import { generateLogMessage as log } from '../utils/logMessage.js';

class Message {
	constructor({ type, roomCode, payload }) {
		this.type = type;
		this.roomCode = roomCode;
		this.payload = payload;
	}
}

class Player {
	constructor(socket, symbol) {
		this.socket = socket;
		this.symbol = symbol;
		this.gameReady = false;
	}

	get ready() {
		return this.socket && this.socket.readyState === this.socket.OPEN;
	}

	message({ type, roomCode, payload }) {
		if (this.ready) {
			this.socket.send(JSON.stringify({ type, roomCode, payload }));
		}

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

	findPlayerIdx(socket) {
		return this.players.findIndex((p) => p.socket === socket);
	}

	messageRoom(message, rejectSocket) {
		this.players.forEach((p) => {
			if (!rejectSocket || p.socket !== rejectSocket) {
				p.message(message);
			}
		});
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
			const joinedMessage = new Message({
				type: 'joined-room',
				roomCode,
				payload: {
					symbol: player.symbol,
					roomFull: targetRoom.full
				}
			});
			player.message(joinedMessage);

			// Notify other player (if exists)
			if (targetRoom.full) {
				const playerJoinMessage = new Message({
					type: 'player-join',
					roomCode
				});
				targetRoom.messageRoom(playerJoinMessage, socket);
			}

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
		const playerIdx = room.findPlayerIdx(socket);
		const leavingPlayerSymbol = room.players[playerIdx].symbol;

		if (room.full) {
			// Remove player and update current player symbol
			room.players.splice(playerIdx, 1);
			room.players[0].symbol = 'X';

			// Notify remaining player
			const leaveMessage = new Message({
				type: 'player-leave',
				roomCode: socket.roomCode,
				payload: {
					newSymbol: 'X'
				}
			});
			room.messageRoom(leaveMessage);

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

	playerReady = (socket, roomCode) => {
		const targetRoom = this.findRoom(roomCode);

		if (targetRoom && targetRoom.full) {
			const targetPlayerIdx = targetRoom.findPlayerIdx(socket);

			if (targetPlayerIdx !== -1) {
				targetRoom.players[targetPlayerIdx].gameReady = true;

				log({
					type: `Room ${roomCode}`,
					message: `Player [${targetRoom.players[targetPlayerIdx].symbol}] is ready.`
				});

				if (targetRoom.players.every((p) => p.gameReady)) {
					targetRoom.gameActive = true;
					console.log('start game');
				}
			}
		}
	};
}
