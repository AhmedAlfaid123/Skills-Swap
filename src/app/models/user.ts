import { Skill } from './skill';
import { Track } from './track';

export interface SkillRef {
  trackId: string | Track;
  skillId: string | Skill;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  bio: string;
  avatarUrl: string;
  skillsToTeach: SkillRef[];
  skillsToLearn: SkillRef[];
}