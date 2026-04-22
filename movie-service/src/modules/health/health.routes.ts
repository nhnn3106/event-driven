import { Router } from "express";

import { getHealthHandler } from "./health.controller";

const healthRouter = Router();

healthRouter.get("/", getHealthHandler);

export { healthRouter };
