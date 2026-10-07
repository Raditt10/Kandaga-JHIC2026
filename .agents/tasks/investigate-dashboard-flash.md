# Dashboard Flash Investigation Report

## Summary

**Issue 1 — "Memuat karya Anda dari database..." label:**  
The loading bar is rendered unconditionally whenever `memuatKarya === true`, which is the initial state. It appears as a gray rounded bar at the top of the content area on every page load, including on tabs other than the dashboard tab. There is no transition or skeleton: it simply renders as visible text in a box. The fix is to either hide it entirely (swapping it for inline skeletons on the relevant cards) or scope it to the dashboard tab only.

**Issue 2 — Greeting flicker ("Halo, Siswa Kandaga!") and avatar flicker ("PK" / "Pengguna Kandaga"):**  
Both are caused by the same root: `useSession()` from `next-auth/react` returns `session === undefined` (status `"loading"`) on the client's first render, before the JWT is verified. The greeting falls back to `"Siswa Kandaga"` and the navbar avatar falls back to `"Pengguna Kandaga"` / initials `"PK"`. No `status` guard is in place in either component to suppress the fallback text while the session is loading. The `SessionProvider` in `AuthProvider.tsx` has no `refetchOnWindowFocus: false` or `initialSession` prop, so there is also a second flicker on window-focus re-fetch.

---

## Evidence

### Issue 1: "Memuat karya Anda dari database..."

**File:** `src/app/student/page.tsx`  
**Lines 270–277** (inside `StudentDashboardContent`, outside any tab condition):

```tsx
{/* ── Status pemuatan karya dari database ── */}
{memuatKarya && (
  <div className="p-4 rounded-2xl bg-ink-100 border border-ink-150 text-xs font-semibold text-ink-600">
    Memuat karya Anda dari database…
  </div>
)}
```

**The controlling state:**

```tsx
const [memuatKarya, setMemuatKarya] = useState(true)  // line ~153
```

`memuatKarya` is initialised to `true` and is only set to `false` after the `fetch("/api/student/projects")` call completes (inside `muatKarya()`, lines ~227–251). The `fetch` is triggered in a `useEffect` with an empty dependency array (line ~254), meaning:

1. Component mounts → `memuatKarya = true` → the gray bar is visible immediately.
2. `fetch` returns → `memuatKarya = false` → bar disappears.

The bar is rendered **outside any `activeTab` guard**, so it appears on every tab of the dashboard, not only on the "Karya Saya" tab where its result is actually used.

There is no skeleton replacement — the metric cards and the "Karya Terkini" section render with `projects.length === 0` empty states while the bar is visible, making the page look broken.

---

### Issue 2a: Greeting fallback — "Halo, Siswa Kandaga!"

**File:** `src/app/student/page.tsx`  
**Line 448:**

```tsx
<h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug">
  Halo, <span className="capitalize">
    {session?.user?.username || session?.user?.name || "Siswa Kandaga"}
  </span>!
</h1>
```

**Why it flickers:** `useSession()` is destructured as:

```tsx
const { data: session } = useSession()  // line 139
```

The `status` field is **not captured**. When the page first renders in the browser, `session` is `undefined` (NextAuth is still verifying the JWT cookie against the server). The expression `session?.user?.username` evaluates to `undefined`, so the fallback `"Siswa Kandaga"` renders. Once the session resolves (typically 200–500 ms later), `session.user.username` becomes the real name and the heading re-renders — visible as a text-swap flicker.

---

### Issue 2b: Navbar avatar fallback — "Pengguna Kandaga" / "PK"

**File:** `src/components/dashboard/DashboardShell.tsx`  
**Line 441:**

```tsx
const userName =
  session?.user?.username || session?.user?.name || "Pengguna Kandaga"
```

**Avatar state initialization (lines ~296–310):**

```tsx
const [userAvatarUrl, setUserAvatarUrl] = useState<string | null>(null)

useEffect(() => {
  purgeLegacyAccountCache()
  const userId = session?.user?.id
  if (!userId) {
    setUserAvatarUrl(null)   // ← runs during the loading window
    return
  }
  const cachedAvatar = readUserCache<string>(AVATAR_CACHE_BASE, userId)
  if (cachedAvatar) {
    setUserAvatarUrl(cachedAvatar)
    return
  }
  ...
}, [session?.user?.id])
```

During the loading window (`session === undefined`), `userId` is `undefined`, so `setUserAvatarUrl(null)` is called and the avatar stays null. The avatar button falls back to:

```tsx
getInitials(userName)  // → getInitials("Pengguna Kandaga") → "PK"
```

When the session resolves, `session?.user?.id` changes, the effect re-runs, the real cached avatar (or a fetch to `/api/akun`) sets the real photo, and the button re-renders — visible as a placeholder → real-photo swap.

**The `localStorage` cache (`user-cache.ts`) exists specifically to speed up avatar load** after the first page view, but it does nothing on the very first hydration because `userId` is not yet available to look up the cache key.

---

### Auth Mechanism

- **Library:** `next-auth` v4 (`"next-auth": "^4.24.15"` in `package.json`)
- **Strategy:** JWT (`strategy: "jwt"`, `maxAge: 30 days`) configured in `src/lib/auth-options.ts`
- **Provider wrapper:** `src/lib/AuthProvider.tsx` — a thin wrapper around `<SessionProvider>` with **no extra props** (no `refetchInterval`, no `refetchOnWindowFocus: false`, no `initialSession`)
- **Session shape:** role, username, id, email, verificationStatus are populated in the `session` callback from the JWT token
- **Root layout:** `src/app/layout.tsx` wraps the whole tree in `<AuthProvider>` which means the `SessionProvider` context is available everywhere, but the initial `session` is always `undefined` on the client until the `/api/auth/session` endpoint responds

---

### Existing Loading Patterns in the Codebase

- `src/components/ui/Skeleton.tsx` — a full Skeleton primitive suite (`Skeleton`, `SkeletonText`, `SkeletonAvatar`, `SkeletonBadge`, `SkeletonButton`) exists and is used in `DetailSkeleton.tsx` and the gallery landing section.
- `src/app/student/layout.tsx` — server layout that reads `kandaga_sidebar_collapsed` cookie and passes it via `SidebarPreferenceProvider` to avoid a sidebar-fold flicker. This is the **right pattern** and should be extended.
- `src/app/mitra/menunggu/page.tsx` and `src/app/mitra/ditolak/page.tsx` — the only two pages that correctly check `status !== "loading"` before branching on session state (but they are guarding redirect logic, not UI text).
- No existing skeleton/suppression pattern is applied to the greeting text or the navbar avatar during session loading.

---

## Conclusions and Recommendations

### Fix 1 — Remove or replace the loading bar

The `memuatKarya` bar is the bluntest possible loading indicator: a full-width text-in-a-box that renders outside any tab guard. Two options:

**Option A (recommended):** Delete the bar entirely. Replace it with inline skeleton placeholders:
- On the dashboard tab's "Karya Terkini" section: show 3 skeleton rows while `memuatKarya`.
- On the metric cards (Total Karya, Terverifikasi, etc.): show skeleton numbers while `memuatKarya`.
- On the "Karya Saya" tab: show a `CardSkeleton` grid while `memuatKarya`.

**Option B (minimal):** Keep the bar but wrap it in the dashboard tab guard and style it as a subtle inline indicator:
```tsx
{activeTab === "dashboard" && memuatKarya && (
  <div className="...">Memuat karya...</div>
)}
```

### Fix 2 — Suppress the greeting flicker

Capture `status` from `useSession()` and render a skeleton in place of the greeting while `status === "loading"`:

```tsx
const { data: session, status } = useSession()

// In the greeting heading:
{status === "loading" ? (
  <span className="inline-block w-32 h-7 rounded-lg bg-white/30 animate-pulse" />
) : (
  <span className="capitalize">
    {session?.user?.username || session?.user?.name || "Siswa Kandaga"}
  </span>
)}
```

The same pattern applies to any other name/greeting in the dashboard.

### Fix 3 — Suppress the navbar avatar flicker

In `DashboardShell.tsx`, capture `status` from `useSession()` and suppress the name/initials display while loading:

```tsx
const { data: session, status } = useSession()

const userName =
  status === "loading"
    ? ""
    : session?.user?.username || session?.user?.name || "Pengguna Kandaga"
```

For the avatar circle, render a pulse skeleton instead of the initials while `status === "loading"`:

```tsx
{status === "loading" ? (
  <div className="w-9 h-9 rounded-full bg-ink-150 animate-pulse" />
) : isCustomAvatar(userAvatarUrl) ? (
  <Image ... />
) : (
  getInitials(userName)
)}
```

This eliminates the "PK" flash entirely. The `localStorage` cache in `user-cache.ts` will continue to work as a fast-path after the first load.

### Fix 4 (optional) — Disable refetch on window focus

The `SessionProvider` in `AuthProvider.tsx` triggers a session re-fetch every time the window regains focus (NextAuth default). This causes a second flicker when the user alt-tabs back. Adding `refetchOnWindowFocus={false}` removes this:

```tsx
// src/lib/AuthProvider.tsx
<SessionProvider refetchOnWindowFocus={false}>
  {children}
</SessionProvider>
```

This is safe because the JWT is long-lived (30 days) and session changes (sign-out in another tab) are rare enough that silent re-fetch on focus is not worth the UX cost.
