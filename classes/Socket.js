import { WebSocketServer } from 'ws';
import { generateLogMessage as log } from '../utils/logMessage.js';

export default class TTT_Socket {
	constructor(server) {
		// Create WebSocket server off of HTTP server
		this.wss = new WebSocketServer({ server });

		this.wss.on('connection', (socket) => {
			log({
				type: 'Socket',
				message: `✅ New WebSocket connection: ${socket._socket.remoteAddress}`
			});

			socket.on('close', () => this.onClose(socket));
		});
	}

	onClose = (socket) => {
		log({
			type: 'Socket',
			message: `❌ WebSocket disconnected: ${socket._socket.remoteAddress}`
		});
	};
}
