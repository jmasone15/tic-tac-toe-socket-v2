// TODO - setup localStorage/cookie caching of generated User IDs to prevent multiple rooms.

const { showElement } = domElements;

class TTT_Frontend_Socket {
	constructor() {
		this.socket = new WebSocket('ws://localhost:3001');
		this.roomCode;

		this.socket.addEventListener('open', this.init);
		this.socket.addEventListener('message', this.receiveMessage);

		domElements.createEventListener(domElements.startBtn, () => {
			this.sendMessage({ type: 'player-ready' });
			showElement(domElements.startBtn, 'blue disabled-button');
			domElements.startBtn.textContent =
				'You are Ready! Waiting for opponent...';
		});
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
			this.sendMessage({ type: mode });
		} else if (mode === 'join') {
			this.sendMessage({ type: mode, roomCode: room });
		} else {
			return this.returnHome();
		}
	};

	sendMessage = ({ type, roomCode, payload }) => {
		this.socket.send(
			JSON.stringify({ type, roomCode: roomCode ?? this.roomCode, payload })
		);
		return;
	};

	receiveMessage = ({ data }) => {
		const { type, roomCode, payload } = JSON.parse(data);

		if (type === 'home') {
			alert(payload.message);
			this.returnHome();
		} else if (type === 'joined-room') {
			this.roomCode = roomCode;
			this.populatePreGame();

			if (payload.roomFull) {
				showElement(domElements.startBtn, 'green');
			}
		} else if (type === 'player-join') {
			showElement(domElements.startBtn, 'green');
		} else if (type === 'player-leave') {
			console.log('player left');
		}

		return;
	};

	populatePreGame = () => {
		domElements.roomCodeEl.textContent = socketConnection.roomCode;
		domElements.roomLinkEl.value = `${
			document.location.href.split('?')[0]
		}?mode=join&room=${socketConnection.roomCode}`;
	};

	returnHome = () => {
		document.location.href = '/';
		return;
	};
}
