import type { ReactNode } from "react";
import { useLayout } from ".";
import type { Roles } from "next-auth";

export default function RoleGuard(props: { children: ReactNode | ReactNode[], roles: Roles[], fallback?: ReactNode }): JSX.Element | null {
  const { user } = useLayout()
  if (user) {
    if (props.roles.includes(user.role)) return (
      <>{props.children}</>
    )
  }
  if (props.fallback) return <>props.fallback</>
  return null
}
