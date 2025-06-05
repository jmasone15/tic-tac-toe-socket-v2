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

	// TODO - Error handling | Nightly empty room cleanup
	onMessage = (socket, message) => {
		const messageObj = new Message(message);

		if (messageObj.type === 'create') {
			this.rooms.createRoom(socket);
		} else if (messageObj.type === 'join') {
			this.rooms.joinRoom({ roomCode: messageObj.roomCode, socket });
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
