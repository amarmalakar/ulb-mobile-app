export type LocalizedTitle = {
  en: string;
  hi: string;
};

export type UserServiceSubService = {
  id: string;
  serviceId: string;
  title: LocalizedTitle;
  active: boolean;
  sortOrder: number;
};

export type UserService = {
  id: string;
  ulbId: string;
  title: LocalizedTitle;
  icon: string | null;
  color: string | null;
  active: boolean;
  sortOrder: number;
  subServices: UserServiceSubService[];
  createdAt: string;
  updatedAt: string;
};
