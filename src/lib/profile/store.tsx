"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { MOCK_USER } from "@/lib/mock/user";
import { readLocal, writeLocal } from "@/lib/storage/local";

export type Profile = {
  firstName: string;
  lastName: string;
  phone: string;
  jobFunction: string;
  jobTitle: string;
  email: string;
};

const KEY = "artbo:profile:v1";

const DEFAULT_PROFILE: Profile = {
  firstName: MOCK_USER.firstName,
  lastName: MOCK_USER.lastName,
  phone: MOCK_USER.phone,
  jobFunction: MOCK_USER.jobFunction,
  jobTitle: MOCK_USER.jobTitle,
  email: MOCK_USER.email,
};

function isProfile(value: unknown): value is Profile {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.firstName === "string" &&
    typeof v.lastName === "string" &&
    typeof v.phone === "string" &&
    typeof v.jobFunction === "string" &&
    typeof v.jobTitle === "string" &&
    typeof v.email === "string"
  );
}

type Value = {
  profile: Profile;
  /** False until the stored copy was read, so forms can seed their state once. */
  ready: boolean;
  /** Persists the profile. Returns false when storage rejected the write. */
  saveProfile: (next: Profile) => boolean;
};

const ProfileContext = createContext<Value | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Reading localStorage must happen after mount to keep SSR markup stable.
    // Copy only known fields: older saves may still carry a removed avatar image.
    const { firstName, lastName, phone, jobFunction, jobTitle, email } = readLocal(
      KEY,
      DEFAULT_PROFILE,
      isProfile,
    );
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProfile({ firstName, lastName, phone, jobFunction, jobTitle, email });
    setReady(true);
  }, []);

  const saveProfile = useCallback((next: Profile) => {
    setProfile(next);
    return writeLocal(KEY, next);
  }, []);

  const value = useMemo(() => ({ profile, ready, saveProfile }), [profile, ready, saveProfile]);
  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile(): Value {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used inside <ProfileProvider>");
  return ctx;
}
