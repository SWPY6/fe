import { handle } from "hono/cloudflare-pages"

import app from "../../../feedback/server/app"

export const onRequest = handle(app)
