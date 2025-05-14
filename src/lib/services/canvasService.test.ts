import { describe, it, expect, beforeEach, vi } from "vitest";
import { CanvasService } from "./canvasService";

describe("CanvasService", () => {
	let canvasService: CanvasService;
	let mockCanvas: HTMLCanvasElement;
	let mockContext: CanvasRenderingContext2D;

	beforeEach(() => {
		// Mock canvas and its context
		mockContext = {
			beginPath: vi.fn(),
			arc: vi.fn(),
			fill: vi.fn(),
			fillStyle: "",
		} as unknown as CanvasRenderingContext2D;

		mockCanvas = {
			getContext: vi.fn().mockReturnValue(mockContext),
			width: 1000,
			height: 800,
			getBoundingClientRect: vi.fn().mockReturnValue({
				left: 10,
				top: 10,
			}),
		} as unknown as HTMLCanvasElement;

		canvasService = new CanvasService();
	});

	it("should initialize with canvas", () => {
		canvasService.initialize(mockCanvas);
		expect(mockCanvas.getContext).toHaveBeenCalledWith("2d");
	});

	it("should draw dot grid", () => {
		canvasService.initialize(mockCanvas);
		canvasService.drawDotGrid();

		expect(mockContext.beginPath).toHaveBeenCalled();
		expect(mockContext.arc).toHaveBeenCalled();
		expect(mockContext.fill).toHaveBeenCalled();
		expect(mockContext.fillStyle).toBe("rgba(153, 153, 153, 0.3)");
	});

	it("should get mouse position correctly", () => {
		canvasService.initialize(mockCanvas);

		const event = {
			clientX: 100,
			clientY: 200,
		} as MouseEvent;

		const position = canvasService.getMousePosition(event);
		expect(position).toEqual({ x: 90, y: 190 });
	});
});
