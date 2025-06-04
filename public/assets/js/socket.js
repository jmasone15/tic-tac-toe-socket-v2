class TTT_Frontend_Socket {
	constructor() {
		this.socket = new WebSocket('ws://localhost:3001');

		this.socket.addEventListener('open', () => {
			console.log('hello, world!');
		});
	}
}

const socketConnection = new TTT_Frontend_Socket();
