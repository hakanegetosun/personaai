import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import type { InfluencerCategory } from "@/types/category";

export type UserProfileRow = {
  id: string;
  email: string | null;
  category: InfluencerCategory | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
};

export async function getCurrentUserProfile(): Promise<UserProfileRow | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const { data, error } = await supabase
    .from("user_profile")
    .select("id, email, category, onboarding_completed, created_at, updated_at")
    .eq("id", user.id)
    .single();

  if (error) {
    throw new Error(`Failed to load user profile: ${error.message}`);
  }

  return data as UserProfileRow;
}

export async function requireAuthenticatedUser() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireCompletedOnboarding() {
  const user = await requireAuthenticatedUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_profile")
    .select("category, onboarding_completed")
    .eq("id", user.id)
    .single();

  if (error) {
    redirect("/onboarding");
  }

  if (!data?.category || !data?.onboarding_completed) {
    redirect("/onboarding");
  }

  return {
    user,
    profile: data as {
      category: InfluencerCategory;
      onboarding_completed: boolean;
    },
  };
}
