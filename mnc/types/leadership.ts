export type LeadershipPosition = 'Mayor' | 'Deputy Mayor' | 'Ward Coordinator';

export type LeadershipMember = {
  position: LeadershipPosition | string;
  name: string;
  profilePic: string;
  sortOrder: number;
};
