import { useState } from "react";

/**
 * Returns a number that changes every time `isOpen` flips to true. Use it as
 * the `key` of a dialog's form so each open starts from fresh state, while the
 * closing dialog keeps its content during the exit animation.
 */
export function useDialogSession(isOpen: boolean): number {
  const [session, setSession] = useState(0);
  const [wasOpen, setWasOpen] = useState(isOpen);
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) setSession((value) => value + 1);
  }
  return session;
}
