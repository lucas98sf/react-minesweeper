// biome-ignore lint/style/useFilenamingConvention: class/hook naming convention
import { useCallback, useRef, useState } from "react";

function preventDefault(e: Event) {
  if (!isTouchEvent<Event>(e)) {
    return;
  }

  if (e.touches.length < 2 && e.preventDefault) {
    e.preventDefault();
  }
}

export function isTouchEvent<T>(
  e: React.MouseEvent<T> | React.TouchEvent<T> | Event
): e is React.TouchEvent<T> {
  return e && "touches" in e;
}

interface PressHandlers<T> {
  onClick?: (e: React.MouseEvent<T> | React.TouchEvent<T>) => void;
  onLongPress?: (e: React.MouseEvent<T> | React.TouchEvent<T>) => void;
}

interface Options {
  delay?: number;
  shouldPreventDefault?: boolean;
}

export function useLongPress<T = HTMLButtonElement & { dataset: DOMStringMap }>(
  { onLongPress, onClick }: PressHandlers<T>,
  { delay = 300, shouldPreventDefault = true }: Options = {}
) {
  const [longPressTriggered, setLongPressTriggered] = useState(false);
  const timeout = useRef<NodeJS.Timeout | undefined>(undefined);
  const target = useRef<EventTarget | undefined>(undefined);

  const start = useCallback(
    (e: React.MouseEvent<T> | React.TouchEvent<T>) => {
      const capturedEvent = {
        currentTarget: e.currentTarget,
        target: e.target,
        clientX: "clientX" in e ? e.clientX : undefined,
        clientY: "clientY" in e ? e.clientY : undefined,
        pageX: "pageX" in e ? e.pageX : undefined,
        pageY: "pageY" in e ? e.pageY : undefined,
        type: e.type,
        nativeEvent: e.nativeEvent,
      } as React.MouseEvent<T> | React.TouchEvent<T>;

      if (shouldPreventDefault && e.target) {
        e.target.addEventListener("touchend", preventDefault, {
          passive: false,
        });
        target.current = e.target;
      }

      timeout.current = setTimeout(() => {
        if (onLongPress) {
          onLongPress(capturedEvent);
        }
        setLongPressTriggered(true);
      }, delay);
    },
    [onLongPress, delay, shouldPreventDefault]
  );

  const clear = useCallback(
    (
      e: React.MouseEvent<T> | React.TouchEvent<T>,
      shouldTriggerClick = true
    ) => {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
      if (shouldTriggerClick && !longPressTriggered) {
        onClick?.(e);
      }

      setLongPressTriggered(false);

      if (shouldPreventDefault && target.current) {
        target.current.removeEventListener("touchend", preventDefault);
      }
    },
    [shouldPreventDefault, onClick, longPressTriggered]
  );

  return {
    onMouseDown: (e: React.MouseEvent<T>) => start(e),
    onTouchStart: (e: React.TouchEvent<T>) => start(e),
    onMouseUp: (e: React.MouseEvent<T>) => clear(e),
    onMouseLeave: (e: React.MouseEvent<T>) => clear(e, false),
    onTouchEnd: (e: React.TouchEvent<T>) => clear(e),
  };
}
