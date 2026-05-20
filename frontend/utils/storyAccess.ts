import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { toast } from "sonner";
import { handleSessionExpiry } from "@/utils/handleSessionExpiry";

const serverBaseUrl = process.env.NEXT_PUBLIC_BACKEND_SERVER_URL;

export type StoryAccessStatus = {
  canCreateStories: boolean;
  trialActive: boolean;
  hasActiveSubscription: boolean;
  trialEndDate?: string | null;
};

export async function fetchStoryAccess(
  token: string,
): Promise<StoryAccessStatus | null> {
  if (!serverBaseUrl) return null;

  try {
    const response = await fetch(`${serverBaseUrl}/user/plan/story-access`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok) return null;

    return {
      canCreateStories: Boolean(data?.response?.canCreateStories),
      trialActive: Boolean(data?.response?.trialActive),
      hasActiveSubscription: Boolean(data?.response?.hasActiveSubscription),
      trialEndDate: data?.response?.trialEndDate ?? null,
    };
  } catch {
    return null;
  }
}

export async function requireStoryCreationAccess(
  router: AppRouterInstance,
): Promise<boolean> {
  const token = localStorage.getItem("token");
  if (!token) {
    toast.error("Please login again");
    router.push("/login");
    return false;
  }

  const access = await fetchStoryAccess(token);
  if (!access) {
    toast.error("Unable to verify your subscription. Please try again.");
    return false;
  }

  if (access.canCreateStories) return true;

  toast.error(
    "Your free trial has ended. Please select a plan to continue creating stories",
  );
  router.push("/select-plan");
  return false;
}

export async function fetchStoryAccessWithSessionHandling(
  router: AppRouterInstance,
): Promise<StoryAccessStatus | null> {
  const token = localStorage.getItem("token");
  if (!token || !serverBaseUrl) return null;

  try {
    const response = await fetch(`${serverBaseUrl}/user/plan/story-access`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      if (handleSessionExpiry(data?.message, router, true)) return null;
      return null;
    }

    return {
      canCreateStories: Boolean(data?.response?.canCreateStories),
      trialActive: Boolean(data?.response?.trialActive),
      hasActiveSubscription: Boolean(data?.response?.hasActiveSubscription),
      trialEndDate: data?.response?.trialEndDate ?? null,
    };
  } catch {
    return null;
  }
}
