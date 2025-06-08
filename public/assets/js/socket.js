// TODO - setup localStorage/cookie caching of generated User IDs to prevent multiple rooms.

const { showElement, hideElement } = domElements;

class Game {
	constructor() {
		this.symbol = null;
		this.ready = false;
		this.gameActive = false;
		this.playerMove = false;
		this.moveCount = 0;

		domElements.gameCells.forEach((cell) => {
			cell.addEventListener('click', (e) => {
				e.preventDefault();

				// if (this.gameActive && this.playerMove) {
				// 	this.move(cell);
				// }

				if (!cell.classList.contains('flipped')) {
					this.move(cell);
				}

				return;
			});
		});
	}

	startGame = (startSymbol) => {
		this.playerMove = this.symbol === startSymbol;
		this.gameActive = true;

		if (this.playerMove) {
			showToast({ message: 'Your turn!' });
		} else {
			showToast({ message: 'Opponent turn.', type: 'warning' });
		}

		hideElement(domElements.pregameDiv);
		showElement(domElements.wrapperDiv);
	};

	move = (cell) => {
		const location = cell.getAttribute('data-cell');
		this.moveCount++;
		this.playerMove = false;

		console.log(location);

		// Update DOM & Run Animation
		const back = cell.querySelector('.cell-back');
		back.textContent = this.symbol;

		cell.setAttribute('data-value', this.symbol);
		cell.classList.add('flipped');
	};

	endGame = () => {
		this.gameActive = false;
		this.playerMove = false;
		this.ready = false;
		this.moveCount = 0;

		domElements.startBtn.textContent = 'Start Game';
		hideElement(domElements.wrapperDiv);
		showElement(domElements.pregameDiv);
	};
}

class TTT_Frontend_Socket {
	constructor() {
		this.socket = new WebSocket('ws://localhost:3001');
		this.roomCode;
		this.game = new Game();

		this.socket.addEventListener('open', this.init);
		this.socket.addEventListener('message', this.receiveMessage);

		domElements.createEventListener(domElements.startBtn, () => {
			if (this.game.ready) {
				return;
			} else {
				this.game.ready = true;
			}

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

		switch (type) {
			case 'home':
				alert(payload.message);
				this.returnHome();
				break;
			case 'joined-room':
				this.roomCode = roomCode;
				this.game.symbol = payload.symbol;

				this.populatePreGame();

				if (payload.roomFull) {
					showElement(domElements.startBtn, 'green');
					domElements.pregameHeader.textContent = 'Room is full!';
				}

				break;
			case 'player-join':
				showElement(domElements.startBtn, 'green');
				domElements.pregameHeader.textContent = 'Room is full!';
				showToast({ message: 'Opponent has joined!' });

				break;
			case 'player-leave':
				this.game.symbol = payload.newSymbol;

				hideElement(domElements.startBtn);
				domElements.pregameHeader.textContent = 'Waiting for opponent...';
				showToast({ message: 'Opponent has left!', type: 'error' });

				if (this.game.gameActive) {
					this.game.endGame();
				}

				break;
			case 'player-ready':
				showToast({ message: 'Opponent is ready!' });

				break;
			case 'start':
				this.game.startGame(payload.startSymbol);

				break;
			default:
				break;
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

const socketConnection = new TTT_Frontend_Socket();
