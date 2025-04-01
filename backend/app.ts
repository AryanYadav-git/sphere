import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { authRoute } from './routes/auth';
import { serveStatic } from 'hono/bun';
import { Route } from './routes';

const app = new Hono();

app.use(logger());

app.basePath('/api').route('/', authRoute);
app.basePath('/api').route('/project', Route);

app.get('*', serveStatic({root: "../frontend/dist"}))
app.get('*', serveStatic({path: "../frontend/dist/index.html"}))

export default app
