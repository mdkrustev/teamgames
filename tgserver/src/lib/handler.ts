// src/lib/handler.ts
//import { routeMap } from "../routeMap"; // ⚠️ кръгова зависимост? Не, защото routeMap не зависи от handler


export interface HandlerContext {
  request: Request;
  env: Env;              // вместо `any` — използвай типизиран `Env`
  ctx: ExecutionContext;
  body?: unknown;        // опционално, само за POST/PATCH и т.н.
}

// ... (запази Get, Post, Handler, HandlerContext от преди)

// Помощна функция за метод
function getHandlerMethod(handler: any): string | undefined {
  return handler?.__method;
}

// 🔑 Главната навигационна функция
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
  const handlerMethod = getHandlerMethod(handler);

  if (!handlerMethod) {
    return new Response("Handler missing method metadata", { status: 500 });
  }

  if (method !== handlerMethod) {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    let body: unknown | undefined;
    if (method === "POST") {
      const contentType = request.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        body = await request.json();
      }
    }

    const ctxData: HandlerContext = { request, env, ctx, body };

    const result = await handler(ctxData);

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Handler error:", err);
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Internal Server Error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}