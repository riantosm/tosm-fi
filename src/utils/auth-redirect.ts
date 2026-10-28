import { ROUTES, UPGRADE_QUERY } from "@/constants/routes";

/** Where to go after login/register: `?next=upgrade` (landing "buy") opens the Upgrade dialog. */
export function afterLoginPath(searchParams: URLSearchParams): string {
  return searchParams.get("next") === UPGRADE_QUERY
    ? `${ROUTES.DASHBOARD}?${UPGRADE_QUERY}=1`
    : ROUTES.DASHBOARD;
}
