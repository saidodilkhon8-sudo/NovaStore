"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/language-provider";

interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  role: "user" | "developer" | "admin";
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const { t } = useLanguage();

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (!res.ok) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      setProfile(data.user);
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: profile.username,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to update profile");
        return;
      }

      setSuccess("Profile updated successfully");
      fetchProfile();
    } catch {
      setError("An error occurred while updating profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-elevated rounded w-64" />
          <div className="h-32 bg-elevated rounded-xl" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-8">{t("nav.profile")}</h1>

        <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-surface border border-border space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-primary/10 border border-foreground/20 text-foreground text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 rounded-lg bg-primary/10 border border-foreground/20 text-foreground text-sm flex items-center gap-2">
              {success}
            </div>
          )}

          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24 rounded-full overflow-hidden bg-elevated border border-border flex-shrink-0">
              {profile.avatar ? (
                <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-foreground">
                  {profile.username[0].toUpperCase()}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-secondary-text">Username</label>
            <input
              type="text"
              value={profile.username}
              onChange={(e) => setProfile({ ...profile, username: e.target.value })}
              className="w-full px-4 py-2.5 bg-elevated border border-border rounded-lg focus:outline-none focus:border-foreground text-foreground"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-secondary-text">Email</label>
            <input
              type="email"
              value={profile.email}
              disabled
              className="w-full px-4 py-2.5 bg-elevated border border-border rounded-lg text-secondary-text cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-secondary-text">Role</label>
            <input
              type="text"
              value={profile.role}
              disabled
              className="w-full px-4 py-2.5 bg-elevated border border-border rounded-lg text-secondary-text cursor-not-allowed"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-primary text-background rounded-lg font-medium transition-colors disabled:opacity-50 hover:bg-neutral-200"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
