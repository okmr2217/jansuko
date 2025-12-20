import { SectionParticipant } from "@/lib/db/queries/sections";
import { Users } from "lucide-react";

export function ParticipantList({ participants }: {participants: SectionParticipant[]}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Users className="h-4 w-4 text-muted-foreground" />
      <div className="flex flex-wrap gap-1">
        {participants.map((participant) => (
          <span
            key={participant.id}
            className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs font-medium"
          >
            {participant.displayName}
          </span>
        ))}
      </div>
    </div>
  )
}
