export interface Cursor {
	id: string;
	x: number;
	y: number;
	name: string;
	color: string;
}

export interface UserDetails {
	id: string;
	name: string;
	color: string;
}

export interface CursorPosition {
	x: number;
	y: number;
}

export interface ServerCursor {
	name: string;
	x: number;
	y: number;
	color: string;
}

export type CursorsMap = Record<string, Cursor>;
export type ServerCursorsMap = Record<string, ServerCursor>;
