import { SpeechBubble } from "@/components/mascots";
import { ButtonLink } from "@/components/ui/button";

import type { HomeMascot } from "./context";

/** The mascot of the moment, stepping out of the forest's edge. */
export function MascotNote({ note }: { note: HomeMascot }) {
  return (
    <div className="relative z-10 -mt-10 px-1 sm:-mt-14 sm:px-6">
      <SpeechBubble
        mascot={note.mascot}
        mood={note.mood}
        line={note.line}
        size="md"
        layout="row"
        className="animate-rise [&_blockquote]:text-[15px]"
        action={
          note.action ? (
            <ButtonLink href={note.action.href} size="md" variant="primary">
              {note.action.label}
            </ButtonLink>
          ) : null
        }
      />
    </div>
  );
}
