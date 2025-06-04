import { WebSocketServer } from 'ws';

export default class TTT_Socket {
	constructor(server) {
		// Create WebSocket server off of HTTP server
		this.wss = new WebSocketServer({ server });

		this.wss.on('connection', (socket) => {
			console.log(
				`✅ New WebSocket connection: ${socket._socket.remoteAddress}`
			);

			socket.on('close', () => this.onClose(socket));
		});
	}

	onClose = (socket) => {
		console.log(`❌ WebSocket disconnected: ${socket._socket.remoteAddress}`);
	};
}
