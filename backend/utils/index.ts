import { eq } from "drizzle-orm";
import { db } from "../db";
import { inviteCodes, projectMembers, users } from "../db/schema";

export const isValidUser = async (user: any) => {
  const [validUser] = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(eq(users.email, user.email))
    .limit(1);

  if (!validUser) {
    return null;
  }

  return validUser;
};

export const validateInvite = async ( code :string) => {
  const [invite] = await db
    .select()
    .from(inviteCodes)
    .where(eq(inviteCodes.code, code));

  if (!invite) return { invite: null, error: "Invalid invitation code" };
  if (invite.used) return { invite: null, error: "Invitation already used" };
  if (new Date() > invite.expiresAt)
    return { invite: null, error: "Invitation expired" };

  return { invite: invite, error: null };
};

export const addUserToProject = async (
  invite: any,
  validUser: {
    id: number;
    email: string;
  },
  code: string
) => {
  if (validUser.email !== invite.email) {
    return null;
  }

  await db.transaction(async (tx) => {
    await tx.insert(projectMembers).values({
      projectId: invite.projectId,
      userId: validUser.id,
      role: invite.role,
    });
    await tx
      .update(inviteCodes)
      .set({ used: true })
      .where(eq(inviteCodes.code, code));
  });

  return { message: "Invitation Accepted" };
};
