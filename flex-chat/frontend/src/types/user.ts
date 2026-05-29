export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  fullName?: string;
  avatarUrl?: string;
  bio?: string;
  statusMessage?: string;
  createdAt?: string; 
}

export interface UserCardProps {
  user: User;
  isSelected: boolean;
  onClick: () => void;
}

export type GetUsersParams = {
  searchTerm?: string;
  page?: number;
  pageSize?: number;
};

export type UserProfile = {
  username: string;
  email: string;
  fullName?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  statusMessage?: string | null;
  createdAt: string;
};

export type UserProfileUpdate = {
  fullName?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  statusMessage?: string | null;
};
