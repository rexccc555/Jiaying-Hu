import { handleApi } from "../lib/api.ts";
import { sendMail } from "../lib/mail.ts";
import { cardStore } from "../lib/store.ts";

export default (request: Request) => handleApi(request, cardStore(), sendMail);

export const config = { path: "/api/*" };
