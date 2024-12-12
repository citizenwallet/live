import { APActivity } from 'activitypub-types';

export type Contribution = {
  date: string;
  id: string;
  name: string;
  amount: number;
  description: string;
  source: string;
  image: string;
  discordId: string;
};
