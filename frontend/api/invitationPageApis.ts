export type InvitationPageData = {
  key: string;
  title: string;
  html: string;
  updatedAt?: string | null;
};

export type InvitationPageResponse = {
  message: string;
  response: { data: InvitationPageData } | null;
  error: unknown;
};

const serverBaseUrl = process.env.NEXT_PUBLIC_BACKEND_SERVER_URL;

function assertBaseUrl() {
  if (!serverBaseUrl) {
    throw new Error("Missing NEXT_PUBLIC_BACKEND_SERVER_URL");
  }
}

export async function getInvitationPageAdmin(
  token: string,
  key = "default"
): Promise<InvitationPageData> {
  assertBaseUrl();
  const params = new URLSearchParams({ key });
  const res = await fetch(`${serverBaseUrl}/admin/invitation-page?${params}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });
  const data: InvitationPageResponse = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to fetch invitation page");
  if (!data?.response?.data) throw new Error("Invalid invitation page response");
  return data.response.data;
}

export async function upsertInvitationPageAdmin(
  token: string,
  payload: { key: string; title: string; html: string }
): Promise<InvitationPageData> {
  assertBaseUrl();
  const res = await fetch(`${serverBaseUrl}/admin/invitation-page`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const data: InvitationPageResponse = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to save invitation page");
  if (!data?.response?.data) throw new Error("Invalid invitation page response");
  return data.response.data;
}

export async function getInvitationPagePublic(
  key = "default"
): Promise<InvitationPageData> {
  assertBaseUrl();
  const params = new URLSearchParams({ key });
  const res = await fetch(`${serverBaseUrl}/user/invitation-page?${params}`, {
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });
  const data: InvitationPageResponse = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to fetch invitation page");
  if (!data?.response?.data) throw new Error("Invalid invitation page response");
  return data.response.data;
}
