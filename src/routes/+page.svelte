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

	let socket: Socket;
	let panelEl: HTMLElement; // The interactive panel
	let myName: string = "Assigning...";
	let myId: string | null = null;
	let myColor: string = "#000000"; // Default color, will be assigned by server

	let cursors: Record<string, Cursor> = {};

	onMount(() => {
		// Connect to the Socket.IO server
		socket = io("http://localhost:8686");

		// Get the panel element reference
		const panel = panelEl;
		if (!panel) return;

		// --- Socket Event Listeners ---

		// When connection is established and server assigns details
		socket.on("connect", () => {
			console.log("Connected to server with ID:", socket.id);
			myId = socket.id || "unknown"; // Store my own ID
		});

		socket.on("assignedDetails", (details: { id: string; name: string; color: string }) => {
			myName = details.name;
			myId = details.id;
			myColor = details.color;
			console.log(`Assigned name: ${myName}, ID: ${myId}, Color: ${myColor}`);
		});

		// Receive updates for all cursors
		socket.on("updateCursors", (serverCursors: Record<string, Omit<Cursor, "id">>) => {
			const updatedCursors: Record<string, Cursor> = {};
			for (const id in serverCursors) {
				updatedCursors[id] = { ...serverCursors[id], id };
			}
			cursors = updatedCursors;
		});

		// Handle mouse movement on the panel
		const handleMouseMove = (event: MouseEvent) => {
			if (!myId) return; // Don't send if not yet fully connected/identified

			const rect = panel.getBoundingClientRect();
			const x = event.clientX - rect.left;
			const y = event.clientY - rect.top;

			// Emit cursor position to the server
			socket.emit("cursorMove", { x, y });
		};

		panel.addEventListener("mousemove", handleMouseMove);

		// --- Cleanup on component destroy ---
		return () => {
			panel.removeEventListener("mousemove", handleMouseMove);
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

<div
	bind:this={panelEl}
	class="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4 font-sans text-white"
	aria-label="Interactive panel for cursor tracking"
>
	{#if myName !== "Assigning..."}
		<span class="text-md absolute top-4 right-4">
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
				class="absolute transition-all duration-50 ease-linear"
				style="left: {cursor.x}px; top: {cursor.y}px; transform: translate(-50%, -50%); z-index: 10;"
			>
				<span
					class="bg-opacity-70 absolute top-full left-1/2 mt-1 -translate-x-1/2 rounded px-2 py-0.5 text-xs whitespace-nowrap shadow-md"
				>
					{cursor.name}
				</span>
			</div>
		{/if}
	{/each}
</div>
