import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import * as z from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  walletAddress: text("wallet_address"),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  completed: boolean("completed").default(false),
  priority: integer("priority").default(0),
  dueDate: timestamp("due_date"),
  transactionHash: text("transaction_hash"),
});

// Create a base schema and extend it with custom validation
const baseInsertUserSchema = createInsertSchema(users);
export const insertUserSchema = baseInsertUserSchema.pick({
  username: true,
  password: true,
  walletAddress: true,
}).extend({
  walletAddress: z.string().nullable().refine((val) => {
    if (!val) return true; // Allow null values
    return /^0x[a-fA-F0-9]{40}$/.test(val); // Validate Ethereum address format
  }, "Invalid Ethereum wallet address format. Must start with '0x' followed by 40 hexadecimal characters"),
});

const baseInsertTaskSchema = createInsertSchema(tasks);
export const insertTaskSchema = baseInsertTaskSchema.pick({
  title: true,
  description: true,
  dueDate: true,
}).extend({
  dueDate: z.string().nullable().optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type User = typeof users.$inferSelect;
export type Task = typeof tasks.$inferSelect;