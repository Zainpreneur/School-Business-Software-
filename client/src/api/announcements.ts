import { api } from "./client";
import { Announcement, Paginated, Role } from "../types";

export async function listAnnouncements(page = 1) {
  const { data } = await api.get<Paginated<Announcement>>("/announcements", { params: { page } });
  return data;
}

export async function createAnnouncement(payload: { title: string; body: string; audience?: Role[] }) {
  const { data } = await api.post<{ announcement: Announcement }>("/announcements", payload);
  return data.announcement;
}

export async function deleteAnnouncement(id: string) {
  await api.delete(`/announcements/${id}`);
}
