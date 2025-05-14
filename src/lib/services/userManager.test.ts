import { describe, it, expect, beforeEach } from "vitest";
import { UserManager } from "./userManager";

describe("UserManager", () => {
	let userManager: UserManager;

	beforeEach(() => {
		userManager = new UserManager();
	});

	it("should add a new user with unique name and color", () => {
		const user1 = userManager.addUser("user1");
		const user2 = userManager.addUser("user2");

		expect(user1.name).toBeTruthy();
		expect(user1.color).toBeTruthy();
		expect(user2.name).toBeTruthy();
		expect(user2.color).toBeTruthy();
		expect(user1.name).not.toBe(user2.name);
	});

	it("should update user position", () => {
		userManager.addUser("user1");
		userManager.updateUserPosition("user1", 100, 200);

		const users = userManager.getAllUsers();
		expect(users["user1"].x).toBe(100);
		expect(users["user1"].y).toBe(200);
	});

	it("should remove a user and free up their name", () => {
		const user = userManager.addUser("user1");
		userManager.removeUser("user1");

		const users = userManager.getAllUsers();
		expect(users["user1"]).toBeUndefined();

		// Add a new user - they should be able to get the same name
		const newName = userManager.addUser("user2").name;
		expect([user.name, newName].length).toBeGreaterThan(new Set([user.name, newName]).size);
	});

	it("should handle many users with unique names", () => {
		// Add more users than the number of animal names
		const userIds = Array.from({ length: 30 }, (_, i) => `user${i}`);
		const users = userIds.map((id) => userManager.addUser(id));

		// Check all names are unique
		const names = users.map((u) => u.name);
		expect(new Set(names).size).toBe(names.length);

		// Check we have numeric suffixes for some names
		expect(names.some((name) => /\d+$/.test(name))).toBe(true);
	});
});
