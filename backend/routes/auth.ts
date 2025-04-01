import { Hono } from "hono";
import { getUser, kindeClient, sessionManager } from "../kinde";
import { addUserToProject, isValidUser, validateInvite } from "../utils";
import { db } from "../db";
import { users } from "../db/schema";
import { zValidator } from "@hono/zod-validator";
import { AcceptInviteRegisterSchema } from "../utils/zod-schema";

export const authRoute = new Hono()

  .get("/login", async (c) => {
    const loginUrl = await kindeClient.login(sessionManager(c));
    return c.redirect(loginUrl.toString());
  })

  .get("/register",
    zValidator("query", AcceptInviteRegisterSchema),
    async (c) => {
      console.log(c)
      const { code } = c.req.valid("query");
      
      // Pass through any existing state
      const registerUrl = await kindeClient.register(sessionManager(c), {
        state: code ? JSON.stringify({ inviteCode: code }) : undefined
      });

      return c.redirect(registerUrl.toString());
    }
  )

  .get("/callback", async (c) => {
    const url = new URL(c.req.url);
    await kindeClient.handleRedirectToApp(sessionManager(c), url);

    // Handle state parsing safely
    let code: string | undefined;
    try {
      const state = url.searchParams.get("state");
      if (state) {
        const parsed = JSON.parse(decodeURIComponent(state));
        code = parsed?.inviteCode;
      }
    } catch (error) {
      console.error("Error parsing state:", error);
    }

    const redirectUrl = code
      ? `/api/complete-registration?code=${encodeURIComponent(code)}`
      : "/api/complete-registration";

    return c.redirect(redirectUrl);
  })

  .get("/logout", async (c) => {
    const logoutUrl = await kindeClient.logout(sessionManager(c));
    return c.redirect(logoutUrl.toString());
  })

  .get("/me", getUser, async (c) => {
    const user = c.var.user;
    return c.json({ user });
  })

  .get(
    "/complete-registration",
    getUser,
    zValidator("query", AcceptInviteRegisterSchema),
    async (c) => {
      const user = c.var.user;
      const { code } = c.req.valid("query");
      console.log(code);
      const validUser = await isValidUser(user);

      if (!validUser) {
        await db.insert(users).values({
          kindeId: user.id,
          username: user.given_name,
          email: user.email,
          avatarUrl: user.picture,
          role: "admin",
        });
      }

      if (code) {
        const res = await validateInvite(code);

        if (!res.invite) {
          return c.json({ error: "Invalid or expired invite" }, 404);
        }

        const invite = res.invite;
        let validUser = await isValidUser(invite);

        if (!validUser) {
          return c.json({ error: 'Invalid user' }, 404);
        }

        await addUserToProject(invite, validUser, code)

        return c.redirect(`/projects/${invite.projectId}`);
      }

      return c.redirect("/");
    }
  );
