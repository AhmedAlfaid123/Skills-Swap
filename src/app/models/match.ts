import { Skill } from './skill';
import { Track } from './track';
import { User } from './user';

export interface Match {
  user: User;
  track: Track;
  skillsToTeach: Skill[];
  skillsToLearn: Skill[];
  matchPercentage: number;
}

export interface MatchViewModel {
  userId: string;
  userName: string;
  bio: string;
  avatarUrl: string;
  trackName: string;
  teachSkills: string[];
  learnSkills: string[];
  teachSkillOptions: MatchSkillOption[];
  learnSkillOptions: MatchSkillOption[];
  matchPercentage: number;
}

export interface MatchSkillOption {
  id: string;
  name: string;
}

export interface MatchRequestSelection {
  match: MatchViewModel;
  teachSkillId: string;
  learnSkillId: string;
}

export interface MatchFilters {
  searchTerm: string;
  trackName: string;
  skillName: string;
}

export interface FilterOption {
  value: string;
  label: string;
}
