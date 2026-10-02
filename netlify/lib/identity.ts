import { USER_COOKIE, type User, userByToken, userUsable } from "./accounts.ts";
import { ADMIN_COOKIE, CARD_COOKIE, type Card, type Store, getCard, isAdmin, readCookie, usable } from "./cards.ts";

export interface Visitor {
  admin: boolean;
  user: User | null;
  card: Card | null;
  /** Signed in, but no time left (trial over, nothing paid) or a card that ran out. */
  locked: "user" | "card" | null;
}

export async function visitor(store: Store, request: Request): Promise<Visitor> {
  if (await isAdmin(store, readCookie(request, ADMIN_COOKIE))) return { admin: true, user: null, card: null, locked: null };
  const user = await userByToken(store, readCookie(request, USER_COOKIE));
  if (user) return { admin: false, user, card: null, locked: userUsable(user) ? null : "user" };
  const card = await getCard(store, readCookie(request, CARD_COOKIE));
  if (card) return { admin: false, user: null, card, locked: usable(card) ? null : "card" };
  return { admin: false, user: null, card: null, locked: null };
}

export const allowed = (who: Visitor) => who.admin || ((who.user || who.card) && !who.locked);
