import { handle } from "hono/cloudflare-pages"

import app from "../../../server/agentation/app"

export const onRequest = handle(app)
