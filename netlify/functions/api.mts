import { handleApi } from "../lib/api.ts";
import { cardStore } from "../lib/store.ts";

export default (request: Request) => handleApi(request, cardStore());

export const config = { path: "/api/*" };
