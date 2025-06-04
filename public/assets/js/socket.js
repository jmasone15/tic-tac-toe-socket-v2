// TODO - setup localStorage/cookie caching of generated User IDs to prevent multiple rooms.

class TTT_Frontend_Socket {
	constructor() {
		this.socket = new WebSocket('ws://localhost:3001');

		this.socket.addEventListener('open', this.init);
		this.socket.addEventListener('message', this.receiveMessage);
	}

	init = () => {
		const urlParams = new URLSearchParams(window.location.search);
		const mode = urlParams.get('mode');
		const room = urlParams.get('room');

		// No mode or no room code for joins - return home.
		if (!mode || (mode === 'join' && !room)) {
			return this.returnHome();
		}

		if (mode === 'create') {
			this.sendMessage(mode);
		} else if (mode === 'join') {
			this.sendMessage(mode, room);
		} else {
			return this.returnHome();
		}
	};

	sendMessage = (type, roomCode, payload) => {
		this.socket.send(JSON.stringify({ type, roomCode, payload }));
		return;
	};

	receiveMessage = (message) => {
		console.log(message);
	};

	returnHome = () => {
		document.location.href = '/';
		return;
	};
}

const socketConnection = new TTT_Frontend_Socket();
