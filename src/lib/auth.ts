import { supabase } from "@/lib/supabase";

export async function signInWithGoogle() {
  await supabase.auth.signInWithOAuth({
    provider: "google",
  });
}

export async function signOut() {
  await supabase.auth.signOut();
}
