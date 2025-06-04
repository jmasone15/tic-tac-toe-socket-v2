export default class Message {
	constructor(jsonString) {
		const { type, roomCode, payload } = JSON.parse(jsonString);

		this.type = type;
		this.roomCode = roomCode;
		this.payload = payload;
	}
}
