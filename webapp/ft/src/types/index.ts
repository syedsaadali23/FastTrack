export type Role = "ADMIN" | "ORGANIZER" | "PLAYER";

export interface AuthUser {
  username: string;
  name: string;
  role: Role;
  profilePicture?: string;
}

export interface Event {
  id: number;
  eventName: string;
  sport: string;
  fee: number;
  picture: string;
  isTeamSport: boolean;
  duration: string;
  startDate: string;
  endDate: string;
  totalSlots: number;
  tournamentType: string;
  teamCap: number | null;
  minRequired: number | null;
  isRegistrationOpen: boolean;
  eventStatus: string;
  availableSlots: number;
  isRegistered: boolean;
}

export interface Team {
  id: number;
  name: string;
  sport: string;
  isOpenToRequests: boolean;
  logo: string | null;
  captainUsername: string;
  teamCap: number;
  isRegistered: boolean;
  members: string[];
  pendingRequests: string[];
}

export interface Notification {
  id: number;
  sender: string;
  title: string;
  body: string;
  isRead: boolean;
  isPending: boolean;
}

export interface NotificationsResponse {
  unreadCount: number;
  notifications: Notification[];
}

export interface Profile {
  username: string;
  name: string;
  role: Role;
  profilePicture: string;
}

export interface SearchResults {
  profiles: Array<{ id: number; username: string; name: string; role: Role; rollNumber?: string; profilePicture?: string }>;
  events: Event[];
  teams: Team[];
}
