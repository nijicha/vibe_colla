// +layout.server.ts
import { ServerSocket } from "$lib/server/serverSocket";

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8686;
new ServerSocket(PORT);
