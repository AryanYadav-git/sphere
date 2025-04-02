import { Hono } from "hono";
import { getUser, kindeClient, sessionManager } from "../kinde";
import { db } from "../db";
import { projects, projectMembers, inviteCodes, sprints, userStories, tasks } from "../db/schema";
import { zValidator } from "@hono/zod-validator";
import { and, eq, ne } from "drizzle-orm";
import { addUserToProject, isValidUser, validateInvite } from "../utils";
import { AcceptInviteSchema, AddMemberSchema, CreateNewSprintSchema, CreateNewTaskSchema, CreateNewUserStoriesSchema, ProjectCreateSchema, UpdateTaskStatus } from "../utils/zod-schema";



export const Route = new Hono()
  .post("/create-project", getUser, zValidator("json", ProjectCreateSchema), async (c) => {
      const user = c.var.user;
      const body = await c.req.valid("json");

      try {
        const validUser = await isValidUser(user);
        if (!validUser) {
          return c.json({ error: "Invalid user" }, 404);
        }

        const result = await db.transaction(async (tx) => {
          const [project] = await tx
            .insert(projects)
            .values({
              name: body.name,
              description: body.description,
              ownerId: validUser.id,
              startDate: body.startDate,
              endDate: body.endDate,
            })
            .returning();

          if (!project) {
            throw new Error("Failed to create project");
          }

          await tx.insert(projectMembers).values({
            projectId: project.id,
            userId: validUser.id,
            role: "scrumMaster",
          });

          return project;
        });

        return c.json(result, 201);
      } catch (err) {
        console.error(err);
        return c.json(
          {
            error: "Failed to create project",
            message: err instanceof Error ? err.message : "Unknown error",
          },
          500
        );
      }
    }
  )

  .post("/add-new-member", getUser, zValidator("json", AddMemberSchema), async (c) => {
      const user = c.var.user;
      const body = await c.req.valid("json");

      const validUser = await isValidUser(user);
      if (!validUser) {
        return c.json({ error: "Invalid user" }, 404);
      }

      try {
        const [project] = await db
          .select()
          .from(projects)
          .where(eq(projects.id, body.projectId));

        if (!project) {
          return c.json({ error: "Project not found" }, 404);
        }

        if (project.ownerId !== validUser.id) {
          return c.json({ error: "Invalid project owner" }, 403);
        }

        const code = crypto.randomUUID();
        console.log("invite code : ", code);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        await db.insert(inviteCodes).values({
          code,
          projectId: body.projectId,
          email: body.email,
          role: body.role,
          expiresAt,
        });

        const inviteLink = `${process.env.APP_URL}/project/accept-invite?code=${code}`;
        return c.json({ inviteLink });
      } catch (err) {
        console.error(err);
        return c.json(
          {
            error: "Failed to add member",
            message: err instanceof Error ? err.message : "Unknown error",
          },
          500
        );
      }
    }
  )

  .get("/ff", zValidator("query", AcceptInviteSchema), async (c) => {
    console.log("in accept-invite");
    const { code } = c.req.valid("query");
    if (!code) {
      return c.json({ error: "Code not found" });
    }
    return c.json({ a: "return" });
  })

  .get("/accept-invite", zValidator("query", AcceptInviteSchema), async (c) => {
    console.log("in accept-invite");
    const { code } = c.req.valid("query");
    if (!code) {
      return c.json({ error: "Code not found" });
    }
    console.log("below code");
    try {
      const res = await validateInvite(code);
      console.log("1");
      if (!res.invite) {
        return c.json({ error: "Invalid or expired invite" }, 404);
      }
      console.log("2");
      const invite = res.invite;
      console.log("3");
      let validUser = await isValidUser(invite);
      console.log("4");
      if (!validUser) {
        const registerUrl = await kindeClient.register(sessionManager(c), {
          state: JSON.stringify({ inviteCode: code }),
        });
        return c.redirect(registerUrl.toString());
      }
      console.log("5");
      await addUserToProject(invite, validUser, code);

      return c.redirect(`/projects/${invite.projectId}`);
    } catch (err) {
      console.error(err);
      return c.json({ error: "Failed to accept invite" }, 500);
    }
  })

  .post("/create-new-sprint", getUser, zValidator("json", CreateNewSprintSchema), async (c) => {
      const user = c.var.user;
      const body = c.req.valid("json");
      const validUser = await isValidUser(user);
      if (!validUser) {
        return c.json({ error: "Invalid user" }, 404);
      }
      try {
        console.log(body.projectId, validUser.id);
        const [project] = await db
          .select()
          .from(projectMembers)
          .where(
            and(
              eq(projectMembers.projectId, body.projectId),
              eq(projectMembers.userId, validUser.id),
              ne(projectMembers.role, "member")
            )
          );
        if (!project) {
          return c.json({ error: "User not authorized to create sprint" }, 403);
        }
        await db.insert(sprints).values({
          projectId: body.projectId,
          name: body.name,
          goal: body.goal,
          startDate: body.startDate,
          endDate: body.endDate,
        })
        return c.json({ message: "Sprint created successfully" }, 201);
      } catch (err) {
        console.error(err);
        return c.json({ error: "Failed to find project" }, 500);
      }
    }
  )

  .post('/create-new-user-story', getUser, zValidator("json", CreateNewUserStoriesSchema), async (c) => {
    const user = c.var.user;
    const body = c.req.valid('json');

    const validUser = await isValidUser(user);
    if (!validUser) {
      return c.json({ error: "Invalid user" }, 404);
    }
    try {
      const [sprint] = await db.select({'projectId': sprints.projectId}).from(sprints).where(eq(sprints.id, body.sprintId));

      console.log(sprint)
      if (!sprint?.projectId) {
        return c.json({ error: "Invalid sprint" }, 404);
      }

      const [project] = await db
        .select()
        .from(projectMembers)
        .where(
          and(
            eq(projectMembers.projectId, sprint.projectId),
            eq(projectMembers.userId, validUser.id),
            ne(projectMembers.role, "member")
          )
        );
      if (!project) {
        return c.json({ error: "User not authorized to create sprint" }, 403);
      }
      await db.insert(userStories).values({
        sprintId: body.sprintId,
        title: body.title,
        description: body.description,
        status: body.status,
        priority: body.priority,
      })
      return c.json({ message: "Sprint created successfully" }, 201);
    } catch (err) {
      console.error(err);
      return c.json({ error: "Internal server error" }, 500);
    }
  })

  .post('/create-new-task', getUser, zValidator("json", CreateNewTaskSchema), async (c) => {
    const user = c.var.user;
    const body = c.req.valid('json');

    const validUser = await isValidUser(user);
    if (!validUser) {
      return c.json({ error: "Invalid user" }, 404);
    }

    try{
      const [result] = await db
        .select({
          projectId: projects.id
        })
        .from(userStories)
        .innerJoin(sprints, eq(userStories.sprintId, sprints.id))
        .innerJoin(projects, eq(sprints.projectId, projects.id))
        .innerJoin(projectMembers, and(eq(projectMembers.projectId, projects.id), eq(projectMembers.userId, validUser.id)))
        .where(eq(userStories.id, body.userStoryId));

        if(!result){
          return c.json({ error: "You are not part of the project" }, 403);
        }
        const [assignee] = await db.select().from(projectMembers).where(and(eq(projectMembers.userId, body.assigneeId), eq(projectMembers.projectId, result.projectId)));

        if(!assignee){
          return c.json({ error: "assignee not added in project" }, 404);
        }

        await db.insert(tasks).values({
          userStoryId: body.userStoryId,
          title: body.title,
          description: body.description,
          status: body.status,
          assigneeId: body.assigneeId,
          estimatedHours: body.estimatedHours
        });

        return c.json({ message: "task created successfully" }, 201);

    }catch(err){
      console.error(err);
      return c.json({ error: "Internal server error" }, 500);
    }
  })

  .put('/change-task-status', getUser, zValidator('query', UpdateTaskStatus), async (c) => {
    const user = c.var.user;
    const {taskId, status} = c.req.valid('query');

    const parsedTaskId = parseInt(taskId, 10);
    if(isNaN(parsedTaskId)){
      return c.json({ error: "Invalid task id" }, 400);
    }

    const validUser = await isValidUser(user);
    if (!validUser) {
      return c.json({ error: "Invalid user" }, 404);
    }

    try{
      const [task] = await db.select().from(tasks).where(and(eq(tasks.id, parsedTaskId), eq(tasks.assigneeId, validUser.id)));
      if(!task){
        return c.json({ error: "You are not authorized to update this task" }, 403);
      }
      if(task.status === status){
        return c.json({ error: "Task status is already in requested status" }, 400);
      }
      await db.update(tasks).set({status, updatedAt: new Date()}).where(eq(tasks.id, parsedTaskId));
      return c.json({ message: "Task status updated successfully" }, 200);
    }catch(e){
      console.error(e);
      return c.json({ error: "Internal server error" }, 500);
    }

  })
