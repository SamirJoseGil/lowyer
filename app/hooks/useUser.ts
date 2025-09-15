import { useLoaderData } from "@remix-run/react";
import { isAdmin, isSuperAdmin, isLawyer, isUser, type UserRole } from "~/lib/permissions.server";

type UserWithRole = {
  id: string;
  email: string;
  status: string;
  role: {
    id: number;
    name: string;
    description?: string;
  };
  profile?: {
    firstName?: string | null;
    lastName?: string | null;
    avatarUrl?: string | null;
  } | null;
} | null;

export function useUser() {
  const data = useLoaderData() as { user?: UserWithRole };
  const user = data?.user;

  return {
    user,
    isLoggedIn: !!user,
    role: user?.role?.name as UserRole,
    isAdmin: user ? isAdmin(user) : false,
    isSuperAdmin: user ? isSuperAdmin(user) : false,
    isLawyer: user ? isLawyer(user) : false,
    isUser: user ? isUser(user) : false,
    displayName: user?.profile?.firstName && user?.profile?.lastName 
      ? `${user.profile.firstName} ${user.profile.lastName}`
      : user?.email?.split('@')[0] || 'Usuario',
  };
}
