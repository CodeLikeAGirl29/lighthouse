import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * True once the component has hydrated on the client, false during SSR and
 * the initial client render (so the two match, avoiding a hydration
 * mismatch). Used to gate rendering of anything that reads localStorage.
 *
 * Prefer this over `useState(false) + useEffect(() => setIsMounted(true))`:
 * that pattern calls setState from inside an effect body, which triggers an
 * extra render pass for no real reason. useSyncExternalStore gets the same
 * "flip to true after hydration" behavior without it.
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true, // client snapshot
    () => false // server snapshot
  );
}
