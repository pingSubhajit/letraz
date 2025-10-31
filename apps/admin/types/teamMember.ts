import type {Doc} from '@/convex/_generated/dataModel'

// Enriched team member type that includes the photoUrl from storage
export type EnrichedTeamMember = Doc<'teamMembers'> & {
  photoUrl?: string;
};
