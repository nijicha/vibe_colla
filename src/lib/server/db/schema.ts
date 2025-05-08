import { pgTable, unique, serial, text, integer, varchar } from "drizzle-orm/pg-core";

export const users = pgTable(
	"users",
	{
		id: integer().primaryKey().generatedAlwaysAsIdentity({
			name: "users_id_seq",
			startWith: 1,
			increment: 1,
			minValue: 1,
			maxValue: 2147483647,
			cache: 1,
		}),
		name: varchar({ length: 255 }).notNull(),
		age: integer().notNull(),
		email: varchar({ length: 255 }).notNull(),
	},
	(table) => [unique("users_email_unique").on(table.email)]
);

export const questions = pgTable("questions", {
	id: serial("id").primaryKey(),
	text: text("title"),
	user_id: integer("user_id").references(() => users.id),
});
