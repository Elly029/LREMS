import { useEffect, RefObject } from 'react';

type AnyEvent = MouseEvent | TouchEvent;

export function useOnClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  handler: (event: AnyEvent) => void,
): void {
  useEffect(
    () => {
      const listener = (event: AnyEvent) => {
        const el = ref?.current;
        // Do nothing if clicking ref's element or descendent elements
        if (!el || el.contains(event.target as Node)) {
          return;
        }
        handler(event);
      };

      document.addEventListener(`mousedown`, listener);
      document.addEventListener(`touchstart`, listener);

      return () => {
        document.removeEventListener(`mousedown`, listener);
        document.removeEventListener(`touchstart`, listener);
      };
    },
    // Add ref and handler to effect dependencies
    // It's worth noting that because passed in handler is a new ...
    // ... function on every render that will cause this effect ...
    // ... to re-run every render. It's not a big deal ...
    // ... but to optimize you can wrap handler in useCallback before ...
    // ... passing it into this hook.
    [ref, handler],
  );
}
