import { error } from "@sveltejs/kit";
import { db } from "$lib/server/db";

export async function load() {
	const users = await db.query.users.findMany();

	if (!users) error(404);

	return {
		users: users,
	};
}
