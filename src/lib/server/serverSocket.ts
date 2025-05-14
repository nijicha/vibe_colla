import { createServer } from "node:http";
import { Server, Socket } from "socket.io";
import { UserManager } from "$lib/services/userManager";
import type { Active } from "$lib/types";

export class ServerSocket {
	private io: Server;
	private httpServer = createServer();
	private userManager: UserManager;
	private static instance: ServerSocket | null = null;

	private constructor(port: number) {
		this.io = new Server(this.httpServer, {
			cors: {
				origin: "*",
				methods: ["GET", "POST"],
			},
		});

		this.userManager = new UserManager();

		this.httpServer.listen(port, () => {
			console.log(`Socket.IO server running on ${port}`);
		});

		this.setupSocketHandlers();
	}

	public static getInstance(): ServerSocket {
		if (!ServerSocket.instance) {
			const port = Number(process.env.PUBLIC_SOCKET_PORT) || 8686;
			ServerSocket.instance = new ServerSocket(port);
		}
		return ServerSocket.instance;
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
			socket.on("cursorMove", (data: { x: number; y: number; active?: Active }) => {
				this.userManager.updateUserPosition(socket.id, data.x, data.y, data.active);
				this.broadcastCursors();
			});

			// Handle disconnection
			socket.on("disconnect", () => {
				console.log(`User disconnected: ${socket.id}`);
				this.userManager.removeUser(socket.id);
				this.broadcastCursors();
			});
		});

		this.io.engine.on("connection_error", (err) => {
			if (process.env.PUBLIC_TROUBLESHOOT !== "true") {
				return;
			}

			console.log(err.req); // the request object
			console.log(err.code); // the error code, for example 1
			console.log(err.message); // the error message, for example "Session ID unknown"
			console.log(err.context); // some additional error context
		});
	}

	private broadcastCursors() {
		this.io.emit("updateCursors", this.userManager.getAllUsers());
	}

	close() {
		if (ServerSocket.instance) {
			this.io.close();
			this.httpServer.close();
			ServerSocket.instance = null;
		}
	}
}
