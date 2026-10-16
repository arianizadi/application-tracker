import { Mascot } from "@/components/mascots";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/card";

export default function ApplicationNotFound() {
  return (
    <EmptyState
      art={<Mascot name="tuck" mood="think" className="size-28" title="Tuck the turtle beside a trail sign" />}
      title="This trail goes nowhere"
      action={
        <ButtonLink href="/applications" variant="primary">
          Back to your applications
        </ButtonLink>
      }
    >
      We couldn&apos;t find that application. It may have been deleted — your other applications are right where you left them.
    </EmptyState>
  );
}
