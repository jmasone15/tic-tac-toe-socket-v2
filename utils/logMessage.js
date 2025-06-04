export function generateLogMessage({ type, message }) {
	const now = new Date();
	const timestamp = `[${now.toISOString().replace('T', ' ').substring(0, 19)}]`;
	const messageType = type ?? 'System';

	console.log(`${timestamp} [${messageType}] - ${message}`);
	return;
}
