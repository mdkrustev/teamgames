// AUTO-GENERATED — DO NOT EDIT

import { RouteMap } from "./lib/handler";
import * as user from "./routes/user";

export const routeMap: RouteMap = {
  "/api/user/getAll": { handler: user.getAll },
  "/api/user/createUser": { handler: user.create }
};