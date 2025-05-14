export class CanvasService {
	private ctx: CanvasRenderingContext2D | null = null;
	private canvas: HTMLCanvasElement | null = null;

	initialize(canvas: HTMLCanvasElement) {
		this.canvas = canvas;
		this.ctx = canvas.getContext("2d");
		this.resize();
	}

	resize() {
		if (!this.canvas || !this.ctx) return;

		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
		this.drawDotGrid();
	}

	drawDotGrid() {
		if (!this.ctx || !this.canvas) return;

		const dotSize = 2;
		const dotSpacing = 24;

		this.ctx.fillStyle = "rgba(153, 153, 153, 0.3)";
		const cols = Math.ceil(this.canvas.width / dotSpacing);
		const rows = Math.ceil(this.canvas.height / dotSpacing);

		for (let i = 0; i < rows; i++) {
			for (let j = 0; j < cols; j++) {
				const x = j * dotSpacing;
				const y = i * dotSpacing;

				this.ctx.beginPath();
				this.ctx.arc(x, y, dotSize, 0, Math.PI * 2);
				this.ctx.fill();
			}
		}
	}

	getMousePosition(event: MouseEvent): { x: number; y: number } | null {
		if (!this.canvas) return null;

		const rect = this.canvas.getBoundingClientRect();
		return {
			x: event.clientX - rect.left,
			y: event.clientY - rect.top,
		};
	}
}

export const canvasService = new CanvasService();
