import { z } from "zod";

export const ProjectCreateSchema = z.object({
    name: z.string().min(1).max(255),
    description: z.string().optional(),
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.startDate) <= new Date(data.endDate);
      }
      return true;
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    }
  );

export const AddMemberSchema = z.object({
  projectId: z.number().int().positive(),
  email: z.string().email(),
  role: z.enum(["member", "productOwner", "scrumMaster"]),
});

export const AcceptInviteSchema = z.object({
  code: z.string().uuid(),
});

export const CreateNewSprintSchema = z.object({
  projectId: z.number().int().positive(),
  name: z.string().min(1).max(255),
  goal: z.string().min(1).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const AcceptInviteRegisterSchema = z.object({
  code: z.string().uuid().optional(),
});

export const CreateNewUserStoriesSchema = z.object({
  sprintId: z.number().int().positive(),
  title: z.string().min(1).max(255),
  description: z.string().min(1).optional(),
  priority: z.enum(["low", "medium", "high"]),
  status: z.enum(["backlog", "todo", "inProgress", "done"]),
});

export const CreateNewTaskSchema = z.object({
  userStoryId: z.number().int().positive(),
  title: z.string().min(1).max(255),
  description: z.string().min(1).optional(),
  status: z.enum(["todo", "inProgress", "done"]),
  assigneeId: z.number().int().positive(),
  estimatedHours: z.number().int().positive().optional(),
});

export const UpdateTaskStatus = z.object({
  taskId: z.string(),
  status: z.enum(["todo", "inProgress", "done", "backlog"]),
});
