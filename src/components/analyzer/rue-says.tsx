import { Mascot, type MascotMood } from "@/components/mascots";

export function rueTake(score: number, limited: boolean, mode: "preset" | "jd"): { mood: MascotMood; line: string } {
  if (limited) return { mood: "think", line: "There isn't enough recognized detail for a useful percentage. Treat the lists below as a checklist." };
  if (score >= 85) return { mood: "cheer", line: "Different wording, same skill. Classic. This one reads like it was written for the role." };
  if (score >= 70) return { mood: "happy", line: mode === "jd" ? "Solid trail of evidence. A couple of gaps worth a look, only if they're true." : "Good coverage. A match score is a clue, not a hiring decision, but this is a nice clue." };
  if (score >= 45) return { mood: "think", line: "I found keywords. I did not find your entire potential. Let's investigate the missing category." };
  return { mood: "comfort", line: "This is a wording check, not a verdict. Lots of real skills hide behind different words. Let's find yours." };
}

/** Rue the raccoon, keyword detective, with a speech bubble. */
export function RueSays({ line, mood = "idle", className = "" }: { line: string; mood?: MascotMood; className?: string }) {
  return (
    <div className={`flex items-end gap-3 ${className}`}>
      <Mascot name="rue" mood={mood} className="size-16 shrink-0 sm:size-20" />
      <div className="relative mb-2 min-w-0 rounded-2xl rounded-bl-sm border border-line bg-paper-2/70 px-4 py-3 text-[15px] leading-snug text-ink">
        <p>{line}</p>
        <p className="mt-1 text-xs text-muted">Rue, keyword detective</p>
      </div>
    </div>
  );
}
