import { pgTable, uuid, varchar, text, integer, timestamp, jsonb, primaryKey } from "drizzle-orm/pg-core";

/**
 * USERS TABLE
 * Stores registered users and their Google OAuth profile identity.
 */
export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  googleId: varchar("google_id", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull(),
  displayName: varchar("display_name", { length: 255 }).notNull(),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * GROUPS TABLE (Renamed from Houses)
 * Stores household/group metadata and assigns an admin member.
 */
export const groupsTable = pgTable("groups", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  inviteCode: varchar("invite_code", { length: 6 }).notNull().unique(),
  adminUserId: uuid("admin_user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * GROUP MEMBERS TABLE
 * Junction table mapping users to their respective groups.
 */
export const groupMembersTable = pgTable("group_members", {
  groupId: uuid("group_id").notNull().references(() => groupsTable.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
}, (table) => [
  primaryKey({ columns: [table.groupId, table.userId] }),
]);

/**
 * TASKS TABLE
 * Manages chore items, rotation queues, and completion states within a group.
 */
export const tasksTable = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  groupId: uuid("group_id").notNull().references(() => groupsTable.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  icon: varchar("icon", { length: 16 }).notNull().default("📌"),
  frequencyDays: integer("frequency_days"), // NULL = manual one-off task
  rotationOrder: jsonb("rotation_order").$type<string[]>().notNull(), // Array of user IDs
  currentIndex: integer("current_index").notNull().default(0),
  lastCompletedDate: timestamp("last_completed_date"),
  lastCompletedByUserId: uuid("last_completed_by_user_id").references(() => usersTable.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * TASK HISTORY TABLE
 * Audit log tracking all chore completion events.
 */
export const taskHistoryTable = pgTable("task_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  taskId: uuid("task_id").notNull().references(() => tasksTable.id, { onDelete: "cascade" }),
  groupId: uuid("group_id").notNull().references(() => groupsTable.id, { onDelete: "cascade" }),
  completedByUserId: uuid("completed_by_user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});

export type User = typeof usersTable.$inferSelect;
export type InsertUser = typeof usersTable.$inferInsert;

export type Group = typeof groupsTable.$inferSelect;
export type InsertGroup = typeof groupsTable.$inferInsert;

export type GroupMember = typeof groupMembersTable.$inferSelect;
export type Task = typeof tasksTable.$inferSelect;
export type TaskHistory = typeof taskHistoryTable.$inferSelect;