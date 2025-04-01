import { Hono } from "hono";
import { getUser, kindeClient, sessionManager } from "../kinde";
import { db } from "../db";
import { projects, projectMembers, inviteCodes } from "../db/schema";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { addUserToProject, isValidUser, validateInvite } from "../utils";

const ProjectCreateSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
}).refine(data => {
  if (data.startDate && data.endDate) {
    return new Date(data.startDate) <= new Date(data.endDate);
  }
  return true;
}, {
  message: 'End date must be after start date',
  path: ['endDate'],
});


const AddMemberSchema = z.object({
  projectId: z.number().int().positive(),
  email: z.string().email(),
  role: z.enum(['member', 'productOwner', 'scrumMaster']),
});

export const AcceptInviteSchema = z.object({
  code: z.string().uuid(),
});


export const Route = new Hono()
.post('/create-project', getUser, zValidator('json', ProjectCreateSchema), async (c) => {
  const user = c.var.user;
  const body = await c.req.valid('json');

  try {
    const validUser = await isValidUser(user);
    if (!validUser) {
      return c.json({error: 'Invalid user'}, 404);
    }

    const result = await db.transaction(async (tx) => {
      const [project] = await tx.insert(projects).values({
        name: body.name,
        description: body.description,
        ownerId: validUser.id, 
        startDate: body.startDate,
        endDate: body.endDate,
      }).returning();

      if (!project) {
        throw new Error('Failed to create project');
      }

      await tx.insert(projectMembers).values({
        projectId: project.id,
        userId: validUser.id,
        role: 'scrumMaster',
      });

      return project;
    });

    return c.json(result, 201);
  } catch(err) {
    console.error(err);
    return c.json({ 
      error: 'Failed to create project',
      message: err instanceof Error ? err.message : 'Unknown error'
    }, 500);
  }
})

.post('/add-new-member', getUser, zValidator('json', AddMemberSchema), async (c) => {
  const user = c.var.user;
  const body = await c.req.valid('json');

  const validUser = await isValidUser(user);
  if(!validUser){
    return c.json({error: 'Invalid user'}, 404);
  }

  try{
    const [project] = await db.select().from(projects).where(eq(projects.id, body.projectId));

    if (!project) {
      return c.json({error: 'Project not found'}, 404);
    }

    if(project.ownerId !== validUser.id){
      return c.json({error: 'Invalid project owner'}, 403);
    }

    const code = crypto.randomUUID();
    console.log('invite code : ',code);
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

  }catch(err) {
    console.error(err);
    return c.json({ 
      error: 'Failed to add member',
      message: err instanceof Error ? err.message : 'Unknown error'
    }, 500);
  }
})
.get('/ff', zValidator('query', AcceptInviteSchema), async (c) => {
  console.log('in accept-invite')
  const { code } = c.req.valid('query');
  if(!code){
    return c.json({error: 'Code not found'});
  }
  return c.json({a: 'return'})
})

.get('/accept-invite', zValidator('query', AcceptInviteSchema), async (c) => {
  console.log('in accept-invite')
  const { code } = c.req.valid('query');
  if(!code){
    return c.json({error: 'Code not found'});
  }
  console.log("below code")
  try{
    const res = await validateInvite(code);
    console.log("1")
    if (!res.invite ) {
      return c.json({ error: 'Invalid or expired invite' }, 404);
    }
    console.log("2")
    const invite = res.invite;
    console.log("3")
    let validUser = await isValidUser(invite);
    console.log("4")
    if(!validUser){
      const registerUrl = await kindeClient.register(sessionManager(c),
      {
        state: JSON.stringify({ inviteCode: code })
      }
    );
      return c.redirect(registerUrl.toString());
    }
    console.log("5")
    await addUserToProject(invite, validUser, code)

    return c.redirect(`/projects/${invite.projectId}`);
  }catch(err){
    console.error(err);
    return c.json({ error: 'Failed to accept invite'}, 500);
  }
})

