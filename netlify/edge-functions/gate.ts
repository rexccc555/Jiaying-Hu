import type { Context } from "https://edge.netlify.com";
import { handleGate } from "../lib/gate.ts";
import { cardStore } from "../lib/store.ts";

export default (request: Request, context: Context) => handleGate(request, () => context.next(), cardStore());
