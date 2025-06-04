const createFloatingSymbols = (count = 50) => {
	const symbols = ['X', 'O'];
	const colors = ['#333', '#4D96FF', '#FF6B6B'];

	for (let i = 0; i < count; i++) {
		const symbol = document.createElement('span');
		symbol.classList.add('floating-symbol');

		// Randomize Symbol
		symbol.textContent = symbols[Math.floor(Math.random() * symbols.length)];

		// Randomize Direction
		if (Math.random() < 0.5) {
			symbol.classList.add('up');
			symbol.style.bottom = `${Math.random() * -100}px`;
		} else {
			symbol.classList.add('down');
			symbol.style.top = `${Math.random() * -100}px`;
		}

		// Randomize Horizontal Starting Position
		symbol.style.left = `${Math.random() * 100}%`;

		// Randomize Size and Color
		const fontSize = 1 + Math.random() * 4; // 1rem to 5rem
		symbol.style.fontSize = `${fontSize}rem`;
		symbol.style.color = colors[Math.floor(Math.random() * colors.length)];

		// Slightly random animation duration
		const duration = 15 + Math.random() * 15;
		symbol.style.animationDuration = `${duration}s`;

		// Remove the symbol after animation completes
		symbol.addEventListener('animationend', () => {
			symbol.remove();
		});

		document.body.appendChild(symbol);
	}
};

// Start on Load
createFloatingSymbols();

// Add 5 more every few seconds
setInterval(() => {
	createFloatingSymbols(10);
}, 5000);
