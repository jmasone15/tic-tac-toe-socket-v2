const createBtn = document.getElementById('create-room');
const joinBtn = document.getElementById('join-room');
const roomCodeInput = document.getElementById('room-code');

createBtn.addEventListener('click', (e) => {
	e.preventDefault();

	roomCodeInput.style.borderColor = '#ddd';
	document.location.href = '/game?mode=create';
});

joinBtn.addEventListener('click', (e) => {
	e.preventDefault();

	roomCodeInput.style.borderColor = '#ddd';

	if (!roomCodeInput.value) {
		roomCodeInput.style.borderColor = '#f14e4e';
		roomCodeInput.style.animation = 'shake 0.3s linear';
		return;
	}

	document.location.href = `/game?mode=join&room=${roomCodeInput.value}`;
});

roomCodeInput.addEventListener('animationend', (e) => {
	e.preventDefault();
	roomCodeInput.style.animation = '';
});
