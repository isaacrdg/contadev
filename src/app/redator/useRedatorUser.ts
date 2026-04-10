"use client";
import { useEffect, useState } from "react";
import { getTeamMembers, type TeamMember } from "@/lib/team";

const USER_COOKIE = "cd_redator_user";
const team = getTeamMembers();

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function useRedatorUser(): TeamMember | null {
  const [user, setUser] = useState<TeamMember | null>(null);

  useEffect(() => {
    const userId = readCookie(USER_COOKIE);
    if (userId) {
      const found = team.find((m) => m.id === userId);
      setUser(found ?? null);
    }
  }, []);

  return user;
}
