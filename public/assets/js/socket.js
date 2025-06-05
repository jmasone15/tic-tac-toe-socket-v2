// TODO - setup localStorage/cookie caching of generated User IDs to prevent multiple rooms.

class TTT_Frontend_Socket {
	constructor() {
		this.socket = new WebSocket('ws://localhost:3001');
		this.roomCode;

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

	receiveMessage = ({ data }) => {
		const { type, roomCode, payload } = JSON.parse(data);

		if (type === 'home') {
			alert(payload.message);
			this.returnHome();
		} else if (type === 'joined-room') {
			this.roomCode = roomCode;
			populatePreGame();
		}

		return;
	};

	returnHome = () => {
		document.location.href = '/';
		return;
	};
}

const socketConnection = new TTT_Frontend_Socket();
const copyIcon = document.getElementById('copy-icon');
const checkIcon = document.getElementById('check-icon');
const roomCodeEl = document.getElementById('room-code');
const roomLinkEl = document.getElementById('room-link');

const populatePreGame = () => {
	roomCodeEl.textContent = socketConnection.roomCode;
	roomLinkEl.value = `${document.location.href.split('?')[0]}?mode=join&room=${
		socketConnection.roomCode
	}`;
};

copyIcon.addEventListener('click', async (e) => {
	e.preventDefault();
	await navigator.clipboard.writeText(roomLinkEl.value);
	copyIcon.setAttribute('class', 'd-none');
	checkIcon.setAttribute('class', 'fa-solid fa-check');
});
