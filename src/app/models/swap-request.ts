import { Skill } from './skill';
import { User } from './user';

export type SwapRequestStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';

export interface SwapRequest {
  _id: string;
  fromUser: string | User;
  toUser: string | User;
  teachSkillId: string | Skill;
  learnSkillId: string | Skill;
  status: SwapRequestStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface SwapRequestSummary {
  request: SwapRequest;
  counterpartyName: string;
  counterpartyAvatarUrl: string;
  teachSkillName: string;
  learnSkillName: string;
  teachTrackName: string;
  learnTrackName: string;
}

export interface RequestPayload {
  toUser: string;
  teachSkillId: string;
  learnSkillId: string;
}