import { api } from "./api";
import type {
  Event, Team, NotificationsResponse, Profile, SearchResults, AuthUser,
} from "@/types";
import * as mock from "./mockData";

const isMock = () => {
    // Check if we are in a browser and have the flag set
    return typeof window !== 'undefined' && localStorage.getItem("USE_MOCK_DATA") === "true";
};

// ---- Auth ----
export async function loginRequest(username: string, password: string) {
  const { data } = await api.post("/api/auth/login", { username, password });
  return data as { message: string; role: AuthUser["role"]; name: string };
}
export async function registerRequest(payload: Record<string, string>) {
  const { data } = await api.post("/api/auth/register", payload);
  return data as { message: string };
}

// ---- Events ----
export async function listEvents(username: string) {
  if (isMock()) return Promise.resolve(mock.MOCK_EVENTS);
  const { data } = await api.get<Event[]>("/api/events", { params: { username } });
  return data;
}
export async function createEvent(payload: Record<string, any>) {
  const { data } = await api.post("/api/events/create", payload);
  return data;
}
export async function updateEventDetails(id: number, payload: Record<string, any>) {
  const { data } = await api.post(`/api/events/${id}/update-details`, payload);
  return data;
}
export async function requestEventRegistration(id: number, payload: { username: string; paymentProof?: string; isTeam?: boolean; teamId?: number; autoFill?: boolean }) {
  const { data } = await api.post(`/api/events/${id}/request-registration`, payload);
  return data;
}
export async function getRegistrationRequests(adminUsername: string) {
  const { data } = await api.get("/api/registrations/pending", { params: { adminUsername } });
  return data;
}
export async function approveRegistrationRequest(id: number, adminUsername: string) {
  const { data } = await api.post(`/api/registrations/${id}/approve`, { adminUsername });
  return data;
}
export async function rejectRegistrationRequest(id: number, adminUsername: string) {
  const { data } = await api.post(`/api/registrations/${id}/reject`, { adminUsername });
  return data;
}
export async function joinRandomTeam(id: number, username: string) {
  const { data } = await api.post(`/api/events/${id}/join-random`, { username });
  return data;
}
export async function cancelEventRegistration(id: number, username: string) {
  const { data } = await api.post(`/api/events/${id}/cancel-registration`, { username });
  return data;
}
export async function toggleEventRegistration(id: number, adminUsername: string) {
  const { data } = await api.post(`/api/events/${id}/toggle-registration`, { adminUsername });
  return data;
}
export async function postponeEvent(id: number, body: { startDate?: string; endDate?: string; duration?: string; adminUsername: string }) {
  const { data } = await api.post(`/api/events/${id}/postpone`, body);
  return data;
}
export async function makeEventUpcoming(id: number, adminUsername: string) {
  const { data } = await api.post(`/api/events/${id}/upcoming`, { adminUsername });
  return data;
}
export async function startEvent(id: number, adminUsername: string, venue?: string) {
  const { data } = await api.post(`/api/events/${id}/start`, { venue, adminUsername });
  return data;
}
export async function pauseEvent(id: number, adminUsername: string) {
  const { data } = await api.post(`/api/events/${id}/pause`, { adminUsername });
  return data;
}
export async function deleteEvent(id: number, username: string, password: string) {
  const { data } = await api.post(`/api/events/${id}/delete`, { username, password });
  return data;
}

// ---- Teams ----
export async function createTeam(payload: Record<string, any>) {
  const { data } = await api.post("/api/teams/create", payload);
  return data;
}
export async function requestJoinTeam(id: number, username: string) {
  const { data } = await api.post(`/api/teams/${id}/request-join`, { username });
  return data;
}
export async function resolveJoinRequest(id: number, payload: { username: string; requester: string; approve: boolean }) {
  const { data } = await api.post(`/api/teams/${id}/resolve-request`, payload);
  return data;
}
export async function getMyTeams(username: string) {
  const { data } = await api.get<Team[]>("/api/teams/my", { params: { username } });
  return data;
}
export async function removeTeamMember(id: number, payload: { admin: string; target: string; reason: string }) {
  const { data } = await api.post(`/api/teams/${id}/remove-member`, payload);
  return data;
}
export async function toggleTeamRequests(id: number, username: string) {
  const { data } = await api.post(`/api/teams/${id}/toggle-requests`, { username });
  return data;
}
export async function leaveTeam(id: number, username: string) {
  const { data } = await api.post(`/api/teams/${id}/leave`, { username });
  return data;
}
export async function deleteTeam(id: number, username: string) {
  const { data } = await api.post(`/api/teams/${id}/delete-team`, { username });
  return data;
}
export async function registerTeamForSport(id: number, username: string) {
  const { data } = await api.post(`/api/teams/${id}/register-sport`, { username });
  return data;
}
export async function unregisterTeamFromSport(id: number, username: string) {
  const { data } = await api.post(`/api/teams/${id}/unregister-sport`, { username });
  return data;
}
export async function updateTeamSkillLevel(id: number, username: string, skillLevel: number) {
  const { data } = await api.put(`/api/teams/${id}/skill`, { username, skillLevel });
  return data;
}
export async function invitePlayer(teamId: number, username: string, playerUsername: string) {
  const { data } = await api.post(`/api/teams/${teamId}/invite/${playerUsername}`, { username });
  return data;
}
export async function respondToInvitation(teamId: number, username: string, accept: boolean) {
  const { data } = await api.post(`/api/teams/${teamId}/respond-invitation`, { username, accept });
  return data;
}

export async function updateTeamMemberRole(teamId: number, username: string, targetMember: string, newRole: string) {
  const { data } = await api.post(`/api/teams/${teamId}/update-role`, { username, targetMember, newRole });
  return data;
}

// ---- Notifications ----
export async function getNotifications(username: string) {
  const { data } = await api.get<NotificationsResponse>(`/api/notifications/${encodeURIComponent(username)}`);
  return data;
}
export async function createNotification(payload: { senderUsername: string; title: string; body: string }) {
  const { data } = await api.post("/api/notifications/create", payload);
  return data;
}
export async function approveNotification(id: number, adminUsername: string) {
  const { data } = await api.post(`/api/notifications/${id}/approve`, { adminUsername });
  return data;
}
export async function rejectNotification(id: number, adminUsername: string) {
  const { data } = await api.post(`/api/notifications/${id}/reject`, { adminUsername });
  return data;
}
export async function markNotificationRead(id: number, username: string) {
  const { data } = await api.post(`/api/notifications/${id}/read`, { username });
  return data;
}
export async function markAllNotificationsRead(username: string) {
  const { data } = await api.post(`/api/notifications/read-all`, { username });
  return data;
}

// ---- Profile ----
export async function getProfile(username: string) {
  const { data } = await api.get<Profile>(`/api/profile/${encodeURIComponent(username)}`);
  return data;
}
export async function getAnalytics(username: string) {
  const { data } = await api.get(`/api/profile/${encodeURIComponent(username)}/analytics`);
  return data;
}
export async function updateUsername(currentUsername: string, newUsername: string) {
  const { data } = await api.put(`/api/profile/${encodeURIComponent(currentUsername)}/username`, { newUsername });
  return data as { message: string; username: string };
}
export async function updateEmail(username: string, email: string) {
  const { data } = await api.put(`/api/profile/${encodeURIComponent(username)}/email`, { email });
  return data;
}
export async function updatePassword(username: string, oldPassword: string, newPassword: string) {
  const { data } = await api.put(`/api/profile/${encodeURIComponent(username)}/password`, { oldPassword, newPassword });
  return data;
}
export async function updateUserSkillLevel(username: string, sport: string, skillLevel: number) {
  const { data } = await api.put(`/api/profile/${encodeURIComponent(username)}/skill`, { sport, skillLevel });
  return data;
}
export async function updateProfilePicture(username: string, profilePicture: string | null) {
  const { data } = await api.put(`/api/profile/${encodeURIComponent(username)}/picture`, { profilePicture });
  return data;
}
export async function deleteAccount(username: string, password: string) {
  const { data } = await api.post(`/api/profile/${encodeURIComponent(username)}/delete`, { password });
  return data;
}

// ---- Search ----
export async function globalSearch(params: { q?: string; sport?: string; openRegistration?: boolean; openRequests?: boolean }) {
  const { data } = await api.get<SearchResults>("/api/search", { params });
  return data;
}

// ---- Matches & Leaderboard ----
export async function getMatches() {
  if (isMock()) return Promise.resolve(mock.MOCK_MATCHES);
  const { data } = await api.get("/api/matches");
  return data;
}
export async function scheduleMatch(id: number, startTime: string, endTime: string, adminUsername: string) {
  const { data } = await api.post(`/api/matches/${id}/schedule`, { startTime, endTime, adminUsername });
  return data;
}
export async function recordMatchResult(id: number, team1Score: number, team2Score: number, adminUsername: string) {
  const { data } = await api.post(`/api/matches/${id}/result`, { team1Score, team2Score, adminUsername });
  return data;
}
export async function getLeaderboard() {
  if (isMock()) return Promise.resolve(mock.MOCK_LEADERBOARD);
  const { data } = await api.get("/api/matches/leaderboard");
  return data;
}

// ---- Matchmaking ----
export async function findMatch(type: "INDIVIDUAL" | "TEAM", id: string, sport: string, eventId?: number) {
  const { data } = await api.post("/api/matchmaking/find", { type, id, sport, eventId: eventId?.toString() });
  return data;
}
export async function cancelMatchmaking(type: "INDIVIDUAL" | "TEAM", id: string) {
  const { data } = await api.post("/api/matchmaking/cancel", { type, id });
  return data;
}

export async function updateUserPosition(username: string, sport: string, position: string) {
  const { data } = await api.put(`/api/profile/${encodeURIComponent(username)}/position`, { sport, position });
  return data;
}

export async function togglePlayerPool(username: string, payload: { sport: string; position: string; active: boolean }) {
  const { data } = await api.post(`/api/profile/${encodeURIComponent(username)}/toggle-pool`, payload);
  return data;
}

export async function getTeamComposition(teamId: number) {
  const { data } = await api.get(`/api/teams/${teamId}/composition`);
  return data as { required: Record<string, number>; filled: Record<string, number>; remaining: Record<string, number> };
}

export async function getAvailableTeams(sport?: string) {
  const { data } = await api.get("/api/matchmaking/available-teams", { params: { sport } });
  return data as Array<{
    id: number;
    name: string;
    sport: string;
    logo: string | null;
    skillLevel: number;
    captainUsername: string;
    openSlots: Record<string, number>;
  }>;
}

export async function getPlayerPool(sport?: string, position?: string) {
  const { data } = await api.get("/api/matchmaking/player-pool", { params: { sport, position } });
  return data as Array<{
    username: string;
    name: string;
    sport: string;
    position: string;
    skillLevel: number;
    since: string;
    profilePicture?: string;
  }>;
}
