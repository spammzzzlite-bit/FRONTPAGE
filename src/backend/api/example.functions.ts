import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { getServerConfig } from "../config.server";

// Example createServerFn. Server-side handler invoked from the client:
//   const result = await getGreeting({ data: { name: "Ada" } })
// The .handler body runs server-only — imports used only inside it (like
// .server.ts modules) are tree-shaken from the client bundle. Module-level
// code here still ships to the client; for truly server-only helpers, put
// them in a .server.ts file. Use this pattern instead of Supabase Edge
// Functions for server logic.

/**
 * Server function endpoint to greet the user.
 *
 * Under the hood, TanStack Start compiles this into an HTTP POST RPC endpoint.
 * When called from the frontend component (e.g. inside `store.ts` or a UI component):
 * `const res = await getGreeting({ data: { name: 'World' } })`
 * Vite automatically sends a request to the backend Nitro server to run the handler.
 */
export const getGreeting = createServerFn({ method: "POST" })
  .inputValidator(z.object({ name: z.string().min(1) }))
  .handler(async ({ data }) => {
    // This handler runs exclusively on the server side
    const config = getServerConfig();
    return {
      greeting: `Hello, ${data.name}!`,
      mode: config.nodeEnv ?? "unknown",
    };
  });
