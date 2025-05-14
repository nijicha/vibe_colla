import { render, screen } from "@testing-library/svelte";
import { describe, it, expect, beforeEach, vi } from "vitest";
import Page from "./+page.svelte";
import { clientSocketService } from "$lib/services/clientSocketService";
import { canvasService } from "$lib/services/canvasService";

// Mock the services
vi.mock("$lib/services/socketService", () => ({
	socketService: {
		connect: vi.fn(),
		onConnect: vi.fn(),
		onAssignedDetails: vi.fn(),
		onUpdateCursors: vi.fn(),
		disconnect: vi.fn(),
		getUserId: vi.fn().mockReturnValue("test-id"),
		sendCursorPosition: vi.fn(),
	},
}));

vi.mock("$lib/services/canvasService", () => ({
	canvasService: {
		initialize: vi.fn(),
		resize: vi.fn(),
		getMousePosition: vi.fn().mockReturnValue({ x: 100, y: 200 }),
	},
}));

describe("Page Component", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should connect to socket service on mount", () => {
		render(Page);
		expect(clientSocketService.connect).toHaveBeenCalledWith("http://localhost:8686");
	});

	it("should set up socket event handlers", () => {
		render(Page);
		expect(clientSocketService.onConnect).toHaveBeenCalled();
		expect(clientSocketService.onAssignedDetails).toHaveBeenCalled();
		expect(clientSocketService.onUpdateCursors).toHaveBeenCalled();
	});

	it("should initialize canvas service", () => {
		render(Page);
		expect(canvasService.initialize).toHaveBeenCalled();
	});

	it("should display user name after assignment", async () => {
		render(Page);

		// Get the callback registered for assignedDetails
		const assignDetailsCallback = (clientSocketService.onAssignedDetails as any).mock.calls[0][0];

		// Call it with test data
		assignDetailsCallback({ id: "test-id", name: "TestUser", color: "#ff0000" });

		// Check if the name is displayed
		expect(screen.getByText("TestUser")).toBeInTheDocument();
	});

	it("should render cursor elements for other users", async () => {
		render(Page);

		// Get the callback for updating cursors
		const updateCursorsCallback = (clientSocketService.onUpdateCursors as any).mock.calls[0][0];

		// Call it with test data
		updateCursorsCallback({
			user1: { id: "user1", name: "User1", x: 100, y: 200, color: "#ff0000" },
			"test-id": { id: "test-id", name: "TestUser", x: 300, y: 400, color: "#00ff00" },
		});

		// Check if other user's name is displayed, but not the current user
		expect(screen.getByText("User1")).toBeInTheDocument();
		expect(screen.queryByText("TestUser")).not.toBeInTheDocument();
	});
});
