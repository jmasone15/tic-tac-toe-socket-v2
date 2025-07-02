import { WebSocketServer } from 'ws';
import Message from './Message.js';
import Rooms from './Rooms.js';
import { generateLogMessage as log } from '../utils/logMessage.js';

export default class TTT_Socket {
	constructor(server) {
		// Create WebSocket server off of HTTP server
		this.wss = new WebSocketServer({ server });
		this.rooms = new Rooms();

		this.wss.on('connection', (socket) => {
			log({
				type: 'Socket',
				message: `✅ New WebSocket connection: ${socket._socket.remoteAddress}`
			});

			// Socket Handlers
			socket.on('message', (message) => this.onMessage(socket, message));
			socket.on('close', () => this.onClose(socket));
		});
	}

	// TODO - Error handling | Empty room cleanup
	onMessage = (socket, message) => {
		const messageObj = new Message(message);
		const roomCode = messageObj.roomCode;

		if (messageObj.type === 'create') {
			this.rooms.createRoom(socket);
		} else if (messageObj.type === 'join') {
			this.rooms.joinRoom({ roomCode, socket });
		} else if (messageObj.type === 'player-ready') {
			this.rooms.playerReady(socket, roomCode);
		} else if (messageObj.type === 'move') {
			this.rooms.move(socket, roomCode, messageObj.payload);
		} else {
			this.rooms.sendSocketHome(socket, 'Something went wrong...');
		}
	};

	onClose = (socket) => {
		this.rooms.leaveRoom(socket);

		log({
			type: 'Socket',
			message: `❌ WebSocket disconnected: ${socket._socket.remoteAddress}`
		});
	};
}
