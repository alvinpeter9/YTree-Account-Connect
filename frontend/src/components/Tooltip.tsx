import { useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface Props {
  content: string;
  children: ReactNode;
}

interface Position {
  left: number;
  top: number;
}

export function Tooltip({ content, children }: Props) {
  const descriptionId = useId();
  const triggerRef = useRef<HTMLSpanElement>(null);
  const [position, setPosition] = useState<Position>();

  const show = () => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const bounds = trigger.getBoundingClientRect();
    const halfWidth = Math.min(140, Math.max(0, window.innerWidth / 2 - 12));
    const centre = bounds.left + bounds.width / 2;

    setPosition({
      left: Math.min(Math.max(centre, halfWidth), window.innerWidth - halfWidth),
      top: bounds.top - 8,
    });
  };

  return (
    <>
      <span
        ref={triggerRef}
        className="inline-flex rounded-full focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#377e6340]"
        tabIndex={0}
        aria-describedby={descriptionId}
        onMouseEnter={show}
        onMouseLeave={() => setPosition(undefined)}
        onFocus={show}
        onBlur={() => setPosition(undefined)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setPosition(undefined);
        }}
      >
        {children}
        <span className="sr-only" id={descriptionId}>
          {content}
        </span>
      </span>
      {position &&
        createPortal(
          <span
            role="tooltip"
            className="pointer-events-none fixed z-50 w-max max-w-[min(280px,calc(100vw-24px))] -translate-x-1/2 -translate-y-full rounded-lg bg-[#17231f] px-3 py-2 text-center text-xs leading-5 font-normal text-white shadow-lg"
            style={position}
          >
            {content}
          </span>,
          document.body,
        )}
    </>
  );
}
