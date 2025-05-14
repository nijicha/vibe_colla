import type { Active, User } from "$lib/types";

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

const cursorColors = [
	"#0D47A1", // Deep Blue
	"#B71C1C", // Deep Red
	"#1B5E20", // Deep Green
	"#4A148C", // Deep Purple
	"#E65100", // Deep Orange
	"#006064", // Deep Cyan
	"#263238", // Blue Grey
	"#3E2723", // Brown
	"#827717", // Olive
	"#880E4F", // Deep Pink
	"#311B92", // Deep Indigo
	"#BF360C", // Deep Orange-Red
	"#1A237E", // Midnight Blue
	"#33691E", // Forest Green
	"#4A148C", // Royal Purple
];

export class UserManager {
	private users: Record<string, User> = {};
	private usedNames = new Set<string>();
	private colorIndex = 0;

	addUser(userId: string): User {
		const name = this.getUniqueRandomName();
		const color = this.getNextColor();

		const user: User = { name, x: 0, y: 0, color, active: false };
		this.users[userId] = user;

		return user;
	}

	updateUserPosition(userId: string, x: number, y: number, active: Active): void {
		if (this.users[userId]) {
			this.users[userId].x = x;
			this.users[userId].y = y;
			this.users[userId].active = active;
		}
	}

	removeUser(userId: string): void {
		if (this.users[userId]) {
			this.usedNames.delete(this.users[userId].name);
			delete this.users[userId];
		}
	}

	getAllUsers(): Record<string, User> {
		return this.users;
	}

	private getUniqueRandomName(): string {
		if (this.usedNames.size >= animalNames.length) {
			// All names used, append a number
			let count = 1;
			let newName;
			do {
				newName = `${animalNames[Math.floor(Math.random() * animalNames.length)]}${count}`;
				count++;
			} while (this.usedNames.has(newName));
			this.usedNames.add(newName);
			return newName;
		}

		let name;
		do {
			name = animalNames[Math.floor(Math.random() * animalNames.length)];
		} while (this.usedNames.has(name));
		this.usedNames.add(name);
		return name;
	}

	private getNextColor(): string {
		const color = cursorColors[this.colorIndex % cursorColors.length];
		this.colorIndex++;
		return color;
	}
}
