import { describe, it, expect, beforeEach, vi } from "vitest";
import { ClientSocketService } from "./clientSocketService";
import { io as mockIo } from "socket.io-client";

// Mock socket.io-client
vi.mock("socket.io-client", () => {
	const mockSocket = {
		on: vi.fn(),
		emit: vi.fn(),
		disconnect: vi.fn(),
		connected: true,
		id: "mock-socket-id",
	};

	return {
		io: vi.fn().mockReturnValue(mockSocket),
	};
});

describe("SocketService", () => {
	let socketService: ClientSocketService;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let mockSocket: any;

	beforeEach(() => {
		socketService = new ClientSocketService();
		mockSocket = socketService.connect("http://test-url");
	});

	it("should connect to socket server", () => {
		expect(mockIo).toHaveBeenCalledWith("http://test-url");
		expect(socketService.isConnected()).toBe(true);
	});

	it("should handle assigned details event", () => {
		const callback = vi.fn();
		socketService.onAssignedDetails(callback);

		// Find the callback registered for assignedDetails
		const assignedDetailsCallback = mockSocket.on.mock.calls.find(
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(call: any) => call[0] === "assignedDetails"
		)[1];

		// Call it with test data
		const testDetails = { id: "test-id", name: "test-name", color: "#000000" };
		assignedDetailsCallback(testDetails);

		expect(callback).toHaveBeenCalledWith(testDetails);
	});

	it("should handle cursor updates event", () => {
		const callback = vi.fn();
		socketService.onUpdateCursors(callback);

		// Find the callback for updateCursors
		const updateCursorsCallback = mockSocket.on.mock.calls.find(
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(call: any) => call[0] === "updateCursors"
		)[1];

		// Test data
		const serverCursors = {
			user1: { name: "User1", x: 100, y: 200, color: "#ff0000" },
		};

		updateCursorsCallback(serverCursors);

		expect(callback).toHaveBeenCalledWith({
			user1: { id: "user1", name: "User1", x: 100, y: 200, color: "#ff0000" },
		});
	});

	it("should send cursor position", () => {
		socketService.sendCursorPosition({ x: 100, y: 200 });
		expect(mockSocket.emit).toHaveBeenCalledWith("cursorMove", { x: 100, y: 200 });
	});

	it("should disconnect from socket server", () => {
		socketService.disconnect();
		expect(mockSocket.disconnect).toHaveBeenCalled();
	});
});
