import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { UserManager } from "$lib/services/userManager";

export class ServerSocket {
	private io: Server;
	private httpServer = createServer();
	private userManager: UserManager;

	constructor(port: number = 8686) {
		this.io = new Server(this.httpServer, {
			cors: {
				origin: "*",
				methods: ["GET", "POST"],
			},
		});

		this.userManager = new UserManager();

		this.httpServer.listen(port, () => {
			console.log(`Socket.IO server running on http://localhost:${port}`);
		});

		this.setupSocketHandlers();
	}

	private setupSocketHandlers() {
		this.io.on("connection", (socket: Socket) => {
			console.log(`User connected: ${socket.id}`);

			// Add user and assign details
			const user = this.userManager.addUser(socket.id);

			// Send assigned details to client
			socket.emit("assignedDetails", {
				id: socket.id,
				name: user.name,
				color: user.color,
			});

			// Broadcast updated user list
			this.broadcastCursors();

			// Handle cursor movement
			socket.on("cursorMove", (data: { x: number; y: number }) => {
				this.userManager.updateUserPosition(socket.id, data.x, data.y);
				this.broadcastCursors();
			});

			// Handle disconnection
			socket.on("disconnect", () => {
				console.log(`User disconnected: ${socket.id}`);
				this.userManager.removeUser(socket.id);
				this.broadcastCursors();
			});
		});
	}

	private broadcastCursors() {
		this.io.emit("updateCursors", this.userManager.getAllUsers());
	}

	close() {
		this.io.close();
		this.httpServer.close();
	}
}
