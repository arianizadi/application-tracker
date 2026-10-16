import { Mascot } from "@/components/mascots";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/card";

/** notFound() inside the app keeps the sidebar and tab bar. */
export default function AppNotFound() {
  return (
    <EmptyState
      art={<Mascot name="tuck" mood="think" className="size-28" title="Tuck the turtle, studying a trail map" />}
      title="This trail goes nowhere"
      action={
        <ButtonLink href="/home" variant="primary">
          Back to the clearing
        </ButtonLink>
      }
    >
      We couldn&apos;t find that page. Your applications are still right where you left them.
    </EmptyState>
  );
}
