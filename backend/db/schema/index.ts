import { pgTable, serial, text, timestamp, varchar, integer, pgEnum, date, primaryKey, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const sprintStatusEnum = pgEnum('sprint_status', ['planned', 'active', 'completed']);
export const storyStatusEnum = pgEnum('story_status', ['todo', 'inProgress', 'done', 'backlog']);
export const taskStatusEnum = pgEnum('task_status', ['todo', 'inProgress', 'done', 'backlog']);
export const userRoleEnum = pgEnum('user_role', ['admin', 'member', 'productOwner', 'scrumMaster']);
export const storyPriorityEnum = pgEnum('story_priority', ['low', 'medium', 'high']);

// Tables
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  kindeId: varchar('kinde_id').unique().notNull(),
  username: varchar('username', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  avatarUrl: text('avatar_url'),
  role: userRoleEnum('role').default('member'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  ownerId: integer('owner_id').references(() => users.id),
  startDate: date('start_date'),
  endDate: date('end_date'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const projectMembers = pgTable(
  'project_members',
  {
    projectId: integer('project_id').references(() => projects.id).notNull(),
    userId: integer('user_id').references(() => users.id).notNull(),
    role: userRoleEnum('role').default('member'),
  },
  (table) => ({
    compoundKey: primaryKey({
      columns: [table.projectId, table.userId]
    }),
  })
);

export const sprints = pgTable('sprints', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id').references(() => projects.id),
  name: varchar('name', { length: 255 }).notNull(),
  goal: text('goal'),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  status: sprintStatusEnum('status').default('planned'),
  velocity: integer('velocity'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const userStories = pgTable('user_stories', {
  id: serial('id').primaryKey(),
  sprintId: integer('sprint_id').references(() => sprints.id),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  status: storyStatusEnum('status').default('todo'),
  priority: storyPriorityEnum('priority').default('low'),
  storyPoints: integer('story_points'),
  acceptanceCriteria: text('acceptance_criteria'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const tasks = pgTable('tasks', {
  id: serial('id').primaryKey(),
  userStoryId: integer('user_story_id').references(() => userStories.id),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  status: taskStatusEnum('status').default('todo'),
  assigneeId: integer('assignee_id').references(() => users.id),
  estimatedHours: integer('estimated_hours'),
  actualHours: integer('actual_hours'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const inviteCodes = pgTable('invite_codes', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 36 }).unique().notNull(),
  projectId: integer('project_id').references(() => projects.id).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  role: userRoleEnum('role').default('member'),
  expiresAt: timestamp('expires_at').notNull(),
  used: boolean('used').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
  tasks: many(tasks),
}));

export const projectsRelations = relations(projects, ({ many }) => ({
  sprints: many(sprints),
  members: many(projectMembers),
}));