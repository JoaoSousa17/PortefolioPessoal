// Shared between the server route (auth check + expiry), the fetch logic,
// and the admin display card, so they can't drift out of sync. Not a real
// secret — just keeps the feed URL from being blindly guessable, since the
// itinerary has personal notes in it. To rotate it, edit this constant and
// redeploy (matches the rest of this feature: hardcoded on purpose).
export const TRIP_CALENDAR_TOKEN = "116f1376ccac641cf2d23e169b450679"

// The trip ends August 7 — stop serving events from this date onward so the
// feed doesn't linger indefinitely (returns an empty but valid calendar).
export const TRIP_CALENDAR_EXPIRES_ON = "2026-08-10"
