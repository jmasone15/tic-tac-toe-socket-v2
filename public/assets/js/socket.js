// TODO - setup localStorage/cookie caching of generated User IDs to prevent multiple rooms.

class Cell {
	constructor(element) {
		this.element = element;
		this.front = this.element.querySelector('.cell-front');
		this.back = this.element.querySelector('.cell-back');
		this.location = this.element.getAttribute('data-cell');
		this.symbol = 'Y';
	}

	get isFlipped() {
		return this.element.classList.contains('flipped');
	}

	/**
	 * @param {Boolean} bool
	 */
	set active(bool) {
		if (bool) {
			this.front.classList.add('active-cell');
		} else {
			this.front.classList.remove('active-cell');
		}
	}

	flip = (symbol) => {
		this.symbol = symbol;
		this.back.textContent = symbol;
		this.element.setAttribute('data-value', symbol);
		this.element.classList.add('flipped');
	};
}

class Game {
	constructor() {
		this.symbol = null;
		this.ready = false;
		this.gameActive = false;
		this.playerMove = false;
		this.moveCount = 0;
		this.cells = [];

		domElements.gameCells.forEach((element) => {
			this.cells.push(new Cell(element));
		});

		this.cells.forEach((cell) => {
			cell.element.addEventListener('click', (e) => {
				e.preventDefault();

				if (!this.gameActive || !this.playerMove || cell.isFlipped) {
					console.log('Invalid move.');
				} else {
					this.flipCell(cell);
				}

				return;
			});
		});
	}

	/**
	 * @param {Boolean} bool
	 */
	set cellsActive(bool) {
		this.cells.forEach((c) => {
			c.active = bool;
		});
	}

	startGame = (startSymbol) => {
		this.playerMove = this.symbol === startSymbol;
		this.gameActive = true;

		if (this.playerMove) {
			this.cellsActive = true;
			showToast({ message: 'Your turn!' });
		} else {
			this.cellsActive = false;
			showToast({ message: 'Opponent turn.', type: 'warning' });
		}

		hideElement(domElements.pregameDiv);
		showElement(domElements.wrapperDiv);
		showElement(
			domElements.gameBoard,
			this.playerMove ? 'board active-board' : 'board inactive-board'
		);
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

	checkWinScenarios = (isInternal) => {
		const resultObj = {
			result: 'continue',
			cells: []
		};

		if (this.moveCount < 5) {
			return resultObj;
		}

		// Using the data-cell attribute on the element
		const winningCombos = [
			// Row Wins
			['00', '01', '02'],
			['10', '11', '12'],
			['20', '21', '22'],
			// Column Wins
			['00', '10', '20'],
			['01', '11', '21'],
			['02', '12', '22'],
			// Diagonal Wins
			['00', '11', '22'],
			['02', '11', '20']
		];

		// Check each scenario against both symbols
		winningCombos.forEach((combo) => {
			const targetCells = this.findCells(combo);
			const allFlippedAndMatching = targetCells.every(
				(cell) => cell.isFlipped && cell.symbol === targetCells[0].symbol
			);

			if (allFlippedAndMatching) {
				resultObj.result = isInternal ? 'win' : 'loss';
				resultObj.cells = targetCells;
			}
		});

		// If no win and all tiles takes, game ends in tie
		if (this.moveCount === 9) {
			resultObj.result = 'tie';
		}

		return resultObj;
	};

	findCell = (location) => {
		return this.cells.find((cell) => cell.location === location);
	};

	findCells = (locations) => {
		return this.cells.filter((cell) => locations.includes(cell.location));
	};

	flipCell = (cell, isInternal = true) => {
		if (!cell) {
			return;
		}

		let targetSymbol;

		if (isInternal) {
			targetSymbol = this.symbol;

			socketConnection.sendMessage({
				type: 'move',
				payload: { location: cell.location, symbol: this.symbol }
			});
		} else {
			targetSymbol = this.symbol === 'X' ? 'O' : 'X';
		}

		showElement(
			domElements.gameBoard,
			isInternal ? 'board inactive-board' : 'board active-board'
		);

		this.moveCount++;
		cell.flip(targetSymbol);

		const resultObj = this.checkWinScenarios(isInternal);
		console.log(resultObj);

		if (resultObj.result === 'continue') {
			this.cellsActive = !isInternal;
			this.playerMove = !isInternal;

			if (isInternal) {
				showToast({ message: 'Opponent turn.', type: 'warning' });
			} else {
				showToast({ message: 'Your turn!' });
			}
		}

		// Handle end game here
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
			case 'move':
				const targetCell = this.game.findCell(payload.location);

				if (targetCell && !targetCell.isFlipped) {
					this.game.flipCell(targetCell, false);
				}

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

const { showElement, hideElement } = domElements;
const socketConnection = new TTT_Frontend_Socket();
