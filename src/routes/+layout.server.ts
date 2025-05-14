import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
	cors: {
		origin: "*",
		methods: ["GET", "POST"],
	},
});

const PORT = process.env.PORT || 8686;

// Store active users and their cursor data
// Key: socket.id, Value: { name: string, x: number, y: number, color: string }
const users: {
	[key: string]: {
		name: string;
		x: number;
		y: number;
		color: string;
	};
} = {};

// Predefined list of animal names for fun
const animalNames = [
	"Lion",
	"Tiger",
	"Bear",
	"Elephant",
	"Zebra",
	"Monkey",
	"Kangaroo",
	"Panda",
	"Fox",
	"Wolf",
	"Rabbit",
	"Deer",
	"Squirrel",
	"Owl",
	"Eagle",
	"Penguin",
	"Dolphin",
	"Whale",
	"Shark",
	"Octopus",
	"Crab",
	"Lobster",
	"Butterfly",
	"Bee",
];
const usedNames = new Set();

// Predefined list of colors
const cursorColors = [
	"#FF5733",
	"#33FF57",
	"#3357FF",
	"#FF33A1",
	"#A133FF",
	"#33FFA1",
	"#FFBD33",
	"#33FFBD",
	"#BD33FF",
	"#FF3333",
	"#33FF33",
	"#5733FF",
	"#FF8C00",
	"#00CED1",
	"#FF1493",
	"#32CD32",
	"#8A2BE2",
	"#FFD700",
];
let colorIndex = 0;

function getUniqueRandomName() {
	if (usedNames.size >= animalNames.length) {
		// All names used, append a number
		let count = 1;
		let newName;
		do {
			newName = `${animalNames[Math.floor(Math.random() * animalNames.length)]}${count}`;
			count++;
		} while (usedNames.has(newName));
		usedNames.add(newName);
		return newName;
	}

	let name;
	do {
		name = animalNames[Math.floor(Math.random() * animalNames.length)];
	} while (usedNames.has(name));
	usedNames.add(name);
	return name;
}

function getNextColor() {
	const color = cursorColors[colorIndex % cursorColors.length];
	colorIndex++;
	return color;
}

io.on("connection", (socket) => {
	console.log(`User connected: ${socket.id}`);

	// Assign a random name and color to the new user
	const userName = getUniqueRandomName();
	const userColor = getNextColor();
	users[socket.id] = { name: userName, x: 0, y: 0, color: userColor };

	// Send assigned details back to the newly connected client
	socket.emit("assignedDetails", { id: socket.id, name: userName, color: userColor });

	// Broadcast the current state of all cursors to everyone (including the new user)
	io.emit("updateCursors", users);

	// Listen for cursor movements from this client
	socket.on("cursorMove", (data) => {
		if (users[socket.id]) {
			users[socket.id].x = data.x;
			users[socket.id].y = data.y;
			// Broadcast updated cursor positions to all clients
			io.emit("updateCursors", users);
		}
	});

	// Handle disconnection
	socket.on("disconnect", () => {
		console.log(`User disconnected: ${socket.id} (${users[socket.id].name})`);
		if (users[socket.id]) {
			usedNames.delete(users[socket.id].name); // Free up the name
		}
		delete users[socket.id];
		// Broadcast updated cursor list (user removed)
		io.emit("updateCursors", users);
	});
});

httpServer.listen(PORT, () => {
	console.log(`Socket.IO server running on http://localhost:${PORT}`);
});
