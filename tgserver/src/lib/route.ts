// src/lib/router.ts
import { routeMap } from "../routeMap";

export async function routeNavigator(
  request: Request,
  env: Env,
  ctx: ExecutionContext
): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  const route = routeMap[path];

  if (!route) {
    return new Response("Not Found", { status: 404 });
  }

  const handler = route.handler;
  const handlerMethod = (handler as any).__method; // знаем, че има __method

  if (method !== handlerMethod) {
    return new Response("Method Not Allowed", { status: 405 });
  }

  return handler(request, env, ctx);
}