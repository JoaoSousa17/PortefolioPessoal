// lib/auth-helpers.ts
// Shared helpers for admin authentication (localStorage + cookie)

/** Write the admin auth cookie (8-hour session). */
export function setAdminCookie() {
    document.cookie =
      "admin_authenticated=true; path=/; max-age=28800; SameSite=Lax"
  }
  
  /** Remove the admin auth cookie. */
  export function clearAdminCookie() {
    document.cookie =
      "admin_authenticated=; path=/; max-age=0; SameSite=Lax"
  }
  
  /** Full logout: clears localStorage AND the cookie. */
  export function adminLogout() {
    localStorage.removeItem("admin_authenticated")
    localStorage.removeItem("admin_username")
    clearAdminCookie()
  }