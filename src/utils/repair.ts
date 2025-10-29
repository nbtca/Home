import { makeLogtoClient } from "./auth"
import type { UserInfoResponse } from "@logto/browser"

/**
 * Validates if the user has repair admin or member role
 */
export const validateRepairRole = (roles: string[]): boolean => {
  const acceptableRoles = ["repair admin", "repair member"]
  return roles.some(role => acceptableRoles.includes(role.toLowerCase()))
}

/**
 * Checks if user is authenticated and redirects to login-hint if not
 * @param redirectUrl - The URL to redirect back to after login
 * @returns UserInfoResponse if authenticated, undefined if redirected
 */
export const checkAuthAndRedirect = async (
  redirectUrl: string,
): Promise<UserInfoResponse | undefined> => {
  try {
    const logtoClient = makeLogtoClient()
    const authenticated = await logtoClient.isAuthenticated()

    if (!authenticated) {
      window.location.href = `/repair/login-hint?redirectUrl=${encodeURIComponent(redirectUrl)}`
      return undefined
    }

    const claims = await logtoClient.getIdTokenClaims()
    return claims
  }
  catch (error) {
    console.error("Error checking auth status:", error)
    window.location.href = `/repair/login-hint?redirectUrl=${encodeURIComponent(redirectUrl)}`
    return undefined
  }
}

/**
 * Checks if user is authenticated and has required repair role, redirects if not
 * @param redirectUrl - The URL to redirect back to after login
 * @returns UserInfoResponse if authenticated and has role, undefined if redirected
 */
export const requireRepairRole = async (
  redirectUrl: string,
): Promise<UserInfoResponse | undefined> => {
  const userInfo = await checkAuthAndRedirect(redirectUrl)

  if (!userInfo) {
    return undefined
  }

  const hasRole = validateRepairRole(userInfo.roles)
  if (!hasRole) {
    window.location.href = `/repair/login-hint?redirectUrl=${encodeURIComponent(redirectUrl)}`
    return undefined
  }

  return userInfo
}
