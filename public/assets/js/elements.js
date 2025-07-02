class DomElements {
	constructor() {
		// Elements
		this.copyIcon = document.getElementById('copy-icon');
		this.checkIcon = document.getElementById('check-icon');
		this.startBtn = document.getElementById('start-game');
		this.roomCodeEl = document.getElementById('room-code');
		this.roomLinkEl = document.getElementById('room-link');
		this.pregameHeader = document.getElementById('pre-game-header');
		this.pregameDiv = document.getElementById('pre-game');
		this.wrapperDiv = document.getElementById('wrapper');
		this.gameCells = document.querySelectorAll('.cell');
		this.gameBoard = document.getElementById('board');

		// Event Listeners
		this.createEventListener(this.copyIcon, async () => {
			await navigator.clipboard.writeText(this.roomLinkEl.value);
			this.copyIcon.setAttribute('class', 'd-none');
			this.checkIcon.setAttribute('class', 'fa-solid fa-check');

			showToast({ message: 'Link copied!', type: 'success', seconds: 3 });
		});
	}

	showElement = (element, classText = '') => {
		element.setAttribute('class', classText);
		return;
	};

	hideElement(element) {
		element.setAttribute('class', 'd-none');
		return;
	}

	createEventListener = (element, func) => {
		element.addEventListener('click', (e) => {
			e.preventDefault();

			return func();
		});
	};
}

const domElements = new DomElements();
