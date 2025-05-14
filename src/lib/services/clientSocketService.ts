import { io, Socket } from "socket.io-client";
import type { CursorPosition, UserDetails, ServerCursorsMap, CursorsMap } from "$lib/types";

export class ClientSocketService {
	private socket: Socket | null = null;
	private userDetails: UserDetails | null = null;

	connect(url: string): Socket {
		this.socket = io(url, { transports: ["websocket"] });
		return this.socket;
	}

	disconnect() {
		if (this.socket) {
			this.socket.disconnect();
			this.socket = null;
		}
	}

	isConnected(): boolean {
		return !!this.socket?.connected;
	}

	onConnect(callback: () => void) {
		this.socket?.on("connect", callback);
	}

	onConnectError(callback: (err: Error) => void) {
		this.socket?.on("connect_error", callback);
	}

	onAssignedDetails(callback: (details: UserDetails) => void) {
		this.socket?.on("assignedDetails", (details) => {
			this.userDetails = details;
			callback(details);
		});
	}

	onUpdateCursors(callback: (cursors: CursorsMap) => void) {
		this.socket?.on("updateCursors", (serverCursors: ServerCursorsMap) => {
			const updatedCursors: CursorsMap = {};
			for (const id in serverCursors) {
				updatedCursors[id] = { ...serverCursors[id], id };
			}
			callback(updatedCursors);
		});
	}

	sendCursorPosition(position: CursorPosition) {
		if (!this.socket || !this.userDetails) return;
		this.socket.emit("cursorMove", position);
	}

	getUserId(): string | null {
		return this.socket?.id || null;
	}
}

export const clientSocketService = new ClientSocketService();
