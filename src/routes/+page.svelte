<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import { io, Socket } from "socket.io-client";

	interface Cursor {
		id: string;
		x: number;
		y: number;
		name: string;
		color: string; // Add a color property for visual distinction
	}

	// Users collaborative variables
	let socket: Socket;
	let myName: string = "Assigning...";
	let myId: string | null = null;
	let myColor: string = "#000000"; // Default color, will be assigned by server
	let cursors: Record<string, Cursor> = {};

	// Canvas-related variables
	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D | null;

	function drawDotGrid() {
		if (!ctx) return;

		const dotSize = 2;
		const dotSpacing = 24;

		ctx.fillStyle = "rgba(153, 153, 153, 0.3)";
		const cols = Math.ceil(canvas.width / dotSpacing);
		const rows = Math.ceil(canvas.height / dotSpacing);

		for (let i = 0; i < rows; i++) {
			for (let j = 0; j < cols; j++) {
				const x = j * dotSpacing;
				const y = i * dotSpacing;

				if ("beginPath" in ctx) {
					ctx.beginPath();
				}

				if ("arc" in ctx) {
					ctx.arc(x, y, dotSize, 0, Math.PI * 2);
				}

				ctx.fill();
			}
		}
	}

	function resizeCanvas() {
		if (!canvas) return;
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		drawDotGrid();
	}

	onMount(() => {
		// Connect to the Socket.IO server
		socket = io("http://localhost:8686");

		// Canvas initialization
		if (canvas) {
			ctx = canvas.getContext("2d");
			resizeCanvas();
			window.addEventListener("resize", resizeCanvas);
		}

		// --- Socket Event Listeners ---

		// When connection is established and server assigns details
		socket.on("connect", () => {
			myId = socket.id || "unknown"; // Store my own ID
		});

		socket.on("assignedDetails", (details: { id: string; name: string; color: string }) => {
			myName = details.name;
			myId = details.id;
			myColor = details.color;
		});

		// Receive updates for all cursors
		socket.on("updateCursors", (serverCursors: Record<string, Omit<Cursor, "id">>) => {
			const updatedCursors: Record<string, Cursor> = {};
			for (const id in serverCursors) {
				updatedCursors[id] = { ...serverCursors[id], id };
			}
			cursors = updatedCursors;
		});

		// Handle mouse movement on the canvas
		const handleMouseMove = (event: MouseEvent) => {
			if (!myId) return; // Don't send if not yet fully connected/identified

			const rect = canvas.getBoundingClientRect();
			const x = event.clientX - rect.left;
			const y = event.clientY - rect.top;

			// Emit cursor position to the server
			socket.emit("cursorMove", { x, y });
		};

		canvas.addEventListener("mousemove", handleMouseMove);

		// --- Cleanup on component destroy ---
		return () => {
			canvas.removeEventListener("mousemove", handleMouseMove);
			window.removeEventListener("resize", resizeCanvas);
			if (socket) {
				socket.disconnect();
			}
		};
	});

	onDestroy(() => {
		if (socket) {
			socket.disconnect();
		}
	});
</script>

<svelte:head>
	<title>Real-time Cursors</title>
</svelte:head>

<div class="relative h-screen w-full" aria-label="Interactive panel for cursor tracking">
	{#if myName !== "Assigning..."}
		<span class="text-md absolute top-4 right-4 z-10">
			You are:
			<span
				class="rounded-full px-3 py-2 font-semibold"
				style="background-color: {myColor}; color: #fff; text-shadow: 1px 1px 2px rgba(0,0,0,0.7);"
			>
				{myName}
			</span>
		</span>
	{/if}

	{#each Object.values(cursors) as cursor (cursor.id)}
		{#if cursor.id !== myId}
			<div
				class="absolute z-20 transition-all duration-50 ease-linear"
				style="left: {cursor.x}px; top: {cursor.y}px; transform: translate(-50%, -50%);"
			>
				<span
					class="bg-opacity-70 absolute top-full left-1/2 mt-1 -translate-x-1/2 rounded px-2 py-0.5 text-xs whitespace-nowrap shadow-md"
				>
					{cursor.name}
				</span>
			</div>
		{/if}
	{/each}

	<canvas bind:this={canvas} id="dotCanvas" class="absolute inset-0 h-full w-full"></canvas>
</div>
