import { api } from "./api";
import type {
  Event, Team, NotificationsResponse, Profile, SearchResults, AuthUser,
} from "@/types";

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
  const { data } = await api.get<Event[]>("/api/events", { params: { username } });
  return data;
}
export async function createEvent(payload: Record<string, any>) {
  const { data } = await api.post("/api/events/create", payload);
  return data;
}
export async function registerForEvent(id: number, username: string) {
  const { data } = await api.post(`/api/events/${id}/register`, { username });
  return data;
}
export async function cancelEventRegistration(id: number, username: string) {
  const { data } = await api.post(`/api/events/${id}/cancel-registration`, { username });
  return data;
}
export async function toggleEventRegistration(id: number) {
  const { data } = await api.post(`/api/events/${id}/toggle-registration`);
  return data;
}
export async function postponeEvent(id: number, body: { startDate?: string; endDate?: string; duration?: string }) {
  const { data } = await api.post(`/api/events/${id}/postpone`, body);
  return data;
}
export async function startEvent(id: number) {
  const { data } = await api.post(`/api/events/${id}/start`, {});
  return data;
}
export async function pauseEvent(id: number) {
  const { data } = await api.post(`/api/events/${id}/pause`, {});
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
export async function updateUsername(currentUsername: string, newUsername: string) {
  const { data } = await api.put(`/api/profile/${encodeURIComponent(currentUsername)}/username`, { newUsername });
  return data as { message: string; username: string };
}
export async function updatePassword(username: string, oldPassword: string, newPassword: string) {
  const { data } = await api.put(`/api/profile/${encodeURIComponent(username)}/password`, { oldPassword, newPassword });
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
