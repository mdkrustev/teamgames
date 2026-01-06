// src/lib/handler.ts

// ===== ТИПОВЕ =====

export interface HandlerContext {
  request: Request;
  env: Env;
  ctx: ExecutionContext;
  body?: unknown;
}

export type Handler = (ctx: HandlerContext) => any | Promise<any>;

// Тип за обвивката (това, което се слага в routeMap)
export type RouteHandler = (
  request: Request,
  env: Env,
  ctx: ExecutionContext
) => Promise<Response>;

export interface RouteEntry {
  handler: RouteHandler & { __method: "GET" | "POST" };
}

export type RouteMap = Record<string, RouteEntry>;

// ===== ПОМОЩНИЦИ ЗА ДЕФИНИРАНЕ НА ХЕНДЛЪРИ =====

async function getJsonBody(request: Request): Promise<unknown | undefined> {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return await request.json();
  }
  return undefined;
}

export const Get = (userHandler: Handler) =>
  Object.assign(
    async (request: Request, env: Env, ctx: ExecutionContext): Promise<Response> => {
      try {
        const result = await userHandler({ request, env, ctx });
        return new Response(JSON.stringify(result), {
          headers: { "Content-Type": "application/json" },
        });
      } catch (err) {
        return new Response(
          JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    },
    { __method: "GET" as const } // ⚠️ __method, не method!
  );

export const Post = (userHandler: Handler) =>
  Object.assign(
    async (request: Request, env: Env, ctx: ExecutionContext): Promise<Response> => {
      try {
        const body = await getJsonBody(request);
        const result = await userHandler({ request, env, ctx, body });
        return new Response(JSON.stringify(result), {
          headers: { "Content-Type": "application/json" },
        });
      } catch (err) {
        return new Response(
          JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    },
    { __method: "POST" as const } // ⚠️ __method
  );

// ===== НЕ МОЖЕ ДА ИМПОРТВАШ routeMap ТУК! =====
// За да избегнем кръгова зависимост, routeNavigator НЕ се дефинира тук.
// Той трябва да е в отделен файл или в index.ts.