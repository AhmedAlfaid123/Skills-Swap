import { Track } from './track';

export interface Skill {
  _id: string;
  name: string;
  trackId: string | Track;
}