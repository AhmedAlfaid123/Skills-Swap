import { Skill } from './skill';
import { Track } from './track';

export interface SkillRef {
  trackId?: string | { name?: string } | Track;
  skillId?: string | { name?: string } | Skill;
  skillName?: string;
  trackName?: string;
  name?: string;
}

export interface User {
  _id?: string;
  name: string;
  email: string;
  bio: string;
  avatarUrl: string;
  skillsToTeach: SkillRef[];
  skillsToLearn: SkillRef[];
  joinedDate?: string;
}