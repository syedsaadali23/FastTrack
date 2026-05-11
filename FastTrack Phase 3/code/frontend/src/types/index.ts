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
  registeredTeamIds: number[];
  registeredNames: string[];
  registrationStatus: string;
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
  memberRoles: Record<string, string>;
  pendingRequests: string[];
  skillLevel: number;
  isLookingForMatch: boolean;
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
  email?: string;
  profilePicture: string;
  skills: Record<string, number>;
  preferredPositions: Record<string, string>;
  lookingForTeamSport?: string;
  lookingForTeamPosition?: string;
}

export interface SearchResults {
  profiles: Array<{ id: number; username: string; name: string; role: Role; rollNumber?: string; profilePicture?: string }>;
  events: Event[];
  teams: Team[];
}
export interface Match {
  id: number;
  eventId: number;
  team1Name: string;
  team2Name: string;
  team1Score: number;
  team2Score: number;
  startTime: string;
  endTime: string;
  isCompleted: boolean;
  round: number;
  matchType: string;
  nextMatchId?: number;
}

export interface LeaderboardEntry {
  teamName: string;
  points: number;
  played: number;
  won: number;
  lost: number;
  draw: number;
  goalsFor: number;
  goalsAgainst: number;
  rank: number;
}
