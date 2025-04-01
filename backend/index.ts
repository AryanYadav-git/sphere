import app from "./app";

const port = process.env.PORT || 3000;
const server = Bun.serve({
  port: port,
  fetch: app.fetch
});

console.log(`Listening on http://localhost:${server.port} ...`);