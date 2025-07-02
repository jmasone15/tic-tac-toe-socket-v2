// TOAST TYPES:
// - success
// - error
// - info (default)
// - warning

const showToast = ({ message, type = 'info', seconds = 5 }) => {
	if (!message) {
		return;
	}

	const toastContainer = document.getElementById('toast-container');
	const toast = document.createElement('div');

	toast.setAttribute('class', `toast ${type}`);
	toast.textContent = message;
	toast.style.animation = `slideIn 0.3s forwards, fadeOut 0.3s ease-out forwards ${seconds}s`;
	toastContainer.appendChild(toast);

	// Remove toast after animation finishes
	setTimeout(() => {
		toast.remove();
	}, seconds * 1000 + 500);
};
