---
target: src/components/DashboardLayout.tsx
total_score: 16
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 1
target_identity: "file:/home/shana/Documents/code/react/kandaga/src/components/DashboardLayout.tsx"
target_fingerprint: "sha256:acebf25ff07b7bf52e1e8b6331793f744fde741be70fbfcb8866e7a910fc25dd"
target_path: /home/shana/Documents/code/react/kandaga/src/components/DashboardLayout.tsx
timestamp: 2026-10-02T13-28-59Z
slug: src-components-dashboardlayout-tsx
---
Method: dual-agent (A: e0397273-9b1e-44cc-98ad-1cbaa182c182 · B: a812a18a-3ebc-49af-ab50-037514d98c2b)

#### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|:-----:|-----------|
| 1 | Visibility of System Status | 2 | Role switcher in `DashboardLayout` routes to broken 404 paths (`/dashboard`). No active breadcrumb indicators in student, admin, or teacher views. |
| 2 | Match System / Real World | 1 | Admin dashboard exposes developer database jargon ("Non-Nullable Fields", "RBAC Middleware", "Real-time Memory Storage") instead of school governance. Student dashboard references direct "Review Perusahaan", violating the BKK mediation requirement. |
| 3 | User Control and Freedom | 1 | Role navigation routes to non-existent `/[role]/dashboard` URLs, trapping users in 404 dead ends. Teacher review actions lack confirmation or undo states. |
| 4 | Consistency and Standards | 1 | Stark divergence: Company and BKK use dedicated operational app shells with Poppins headings and CSS tokens; Student, Admin, and Teacher use the public marketing Navbar, 250-line Footer, generic Inter typography, and off-brand hex colors (`#891337`, `#90133b`). |
| 5 | Error Prevention | 2 | Role mismatch banner exists but recovery button leads to a broken route. No guardrails against accidental approval in teacher queue. |
| 6 | Recognition Rather Than Recall | 2 | Queues lack search, filtering, and status categorization. Students lack inline guidance on how to earn Kandaga badge tiers. |
| 7 | Flexibility and Efficiency | 2 | Rigid single-path interaction. No batch approvals for teachers, no keyboard shortcuts, and no customizable filters. |
| 8 | Aesthetic and Minimalist Design | 1 | Heavy visual clutter: user credentials repeated 3 times in the top 300px. Generic SaaS gradient banners and floating blur orbs push operational tasks below the fold. |
| 9 | Error Recovery | 2 | Clear permission warnings, but recovery actions lead to broken URLs. |
| 10 | Help and Documentation | 2 | Company and BKK have clean 4-step workflow guides, whereas Student, Admin, and Teacher lack curation guidelines or rubrics. |
| **Total** | | **16 / 40** | **Poor (Major UX overhaul required)** |

#### Design Specificity Verdict

**LLM Assessment**:
Kandaga's landing page establishes a clear, distinguished identity: **"Peti penyimpanan benda berharga"** (treasure chest of curated student artifacts). It celebrates vocational pride (SMKN 13 Bandung: Analis Kimia, TKJ, RPL) through disciplined restraint—flat maroon (`#8B1A2F`), warm gold (`#E8C97A`), warm cream (`#F5F0E8`), ink charcoal (`#1A1A1A`), strict Poppins (`font-heading`) titles, and an explicit ban on AI slop, purple/rose gradients, and decorative blur orbs (`design.md §4`).

When transitioning from the landing page into the role dashboards, the application splits into two contradictory worlds:
1. **The Modernized Cohort (`company/page.tsx`, `bkk/page.tsx`)**: Built with dedicated operational layouts (`CompanyLayout`, `BKKLayout`), proper tokens (`border-ink-150`, `text-ink`, `text-primary`), semantic heading outlines (`h1` → `h2`), and strict adherence to the BKK institutional workflow.
2. **The Generic SaaS Cohort (`DashboardLayout.tsx`, `student/page.tsx`, `admin/page.tsx`, `teacher/page.tsx`)**: Utterly disconnected from Kandaga. They utilize generic SaaS dashboard templates: neon rose/amber gradients, floating circular blur balls (`w-64 h-64 bg-white/10 rounded-full blur-2xl`), arbitrary zinc color scales, complete absence of `font-heading` (100% Inter), and raw developer schema leaks. Furthermore, they are trapped inside a Frankenstein shell that embeds the 250-line public marketing footer directly beneath operational screens.

**Deterministic Scan**:
Assessment B ran `impeccable detect` and structural analysis across all dashboard files, revealing:
- **Fatal Routing Flaw**: `DashboardLayout.tsx` (lines 86 & 109) generates links to `/${r.slug}/dashboard`, which returns a 404 because the actual route structure is `/${r.slug}` (`/student`, `/admin`, `/teacher`, `/company`, `/bkk`).
- **Typography Violations**: 20+ instances of sub-12px text (`text-[11px]`) across Student, Admin, and Teacher pages. Complete omission of `font-heading` on headings, defaulting to generic Inter. Skipped heading levels (`h1` jumping directly to `h3`).
- **Off-Brand Color Tokens**: Widespread use of arbitrary hex codes (`#90133b`, `#891337`, `#a61743`) and raw zinc shades instead of theme tokens (`primary`, `primary-dark`, `ink`, `cream`, `accent`).
- **Card-in-Card Nesting**: Welcome banners and metric blocks use heavily nested containers and artificial gradient cards.

#### Overall Impression
A stark architectural and visual disconnect. While the public landing page is an editorial showcase of vocational craftsmanship, the student, admin, and teacher dashboards feel like unfinished, copy-pasted SaaS templates trapped inside a public marketing wrapper with broken navigation links.

#### What's Working
1. **Authentic BKK Institutional Flow (`company`, `bkk`)**: Rigorously respects the security and legal rules defined in `AGENTS.md` (companies cannot contact underage students directly; all interest routes through BKK).
2. **Dedicated Operational Shell Architecture (`CompanyLayout`, `BKKLayout`)**: Compact 56px sticky app header, active pill nav, breadcrumb trail, and isolation from marketing clutter.
3. **Role Mismatch Detection Guard**: `DashboardLayout.tsx` checks whether the active session role matches the page role and provides clear feedback.

#### Priority Issues

- **[P0] Broken Routing & Frankenstein Dashboard Shell**
  - **What**: `DashboardLayout.tsx` links switcher buttons and redirects to `/${r.slug}/dashboard`, triggering 404 errors. Student, Admin, and Teacher are trapped in a layout embedding the public landing Navbar with `pt-28` and followed by the 250-line marketing Footer.
  - **Why it matters**: Breaks user navigation (Nielsen #3), traps users in 404s, and clutters operational screens with irrelevant landing page links.
  - **Fix**: Standardize all 5 roles on a dedicated, lightweight `RoleDashboardLayout` modeled after `CompanyLayout`. Remove public Navbar/Footer from operational dashboards. Fix route links to `/${r.slug}`.
  - **Suggested command**: `/impeccable layout`

- **[P1] Complete Abandonment of Kandaga Visual Identity & Typography Rules**
  - **What**: In `student`, `admin`, and `teacher`, `font-heading` (Poppins) is completely missing, headings jump from `h1` to `h3`, text drops to `text-[11px]`, and colors use arbitrary neon rose/amber/zinc gradients and floating blur orbs.
  - **Why it matters**: Violates non-negotiable rules in `design-rules.md` (§1, §2, §3, §6). Dashboards look like AI slop pasted from generic templates.
  - **Fix**: Apply `font-heading` to all headings, enforce semantic heading sequence (`h1` → `h2` → `h3`), enforce the 12px minimum floor, remove blur orbs, and apply Kandaga tokens (`bg-primary`, `text-ink`, `border-ink-150`, `bg-cream`, `text-accent`).
  - **Suggested command**: `/impeccable typeset`

- **[P2] Developer Schema Leaks & Jargon Barrier in Admin Dashboard**
  - **What**: `admin/page.tsx` exposes backend database schema internals ("Non-Nullable Fields: 4 Fields Mandatory", "RBAC Middleware", "Real-time Memory Storage", "Username (Non-Nullable)") instead of school governance metrics.
  - **Why it matters**: Catastrophic violation of Nielsen Heuristic #2 (Match between system and real world). Unusable for school staff.
  - **Fix**: Redesign Admin around school administration: "Total Siswa Terdaftar", "Guru Pembimbing per Jurusan", "Mitra DUDI Aktif", "Antrean Kurasi". Replace schema columns with human labels ("Nama Pengguna", "Email", "Peran", "Aksi").
  - **Suggested command**: `/impeccable clarify`

- **[P3] Triple Redundancy & Cluttered Welcome Banners**
  - **What**: User credentials (username, email, role) are repeated 3 times within the top 300px in Student, Admin, and Teacher dashboards.
  - **Why it matters**: Consumes over half the visible viewport before any actionable work is shown, inflating cognitive load.
  - **Fix**: Rely on the header profile avatar for credentials. Strip the 3-column session box from welcome banners and bring actionable lists and metrics directly into the primary viewport.
  - **Suggested command**: `/impeccable distill`

#### Persona Red Flags
- **Alex (Power User / Admin / Teacher)**:
  - Role switcher links land on 404 pages (`/dashboard`).
  - Teacher review queue lacks batch actions and search.
  - Admin user table lacks search bar, role filter dropdown, or pagination.
- **Jordan (First-Time Student)**:
  - Confused by "5 Dilihat Industri" badge without knowing what steps to take.
  - No rubric or guide explaining how to achieve the 4 prestigious Kandaga badge tiers (Karya Terpilih vs. Unggulan vs. Diminati Industri).
  - Confused by seeing credentials repeated three times.
- **Sam (Accessibility-Dependent User)**:
  - 20+ text instances violate WCAG readability by dropping to `text-[11px]`.
  - Headings jump from `h1` directly to `h3`, breaking screen reader document outlines.
  - Role switcher buttons in `DashboardLayout` have low-contrast `zinc-500` text on `zinc-50` backgrounds.

#### Minor Observations
- Teacher review actions ("Setujui" / "Revisi") are one-way dead ends with no confirmation dialogs.
- Inconsistent badge styling across roles (some use Tailwind `rose-100`, others hardcoded hex).
- `DashboardLayout` lacks responsive mobile drawer navigation compared to `CompanyLayout` and `BKKLayout`.

#### Questions to Consider
- "Should student, teacher, and admin share the same refined app-shell paradigm already proven in `CompanyLayout` and `BKKLayout`?"
- "What if the student dashboard centered on the curated portfolio timeline and badge progression rather than generic stats?"
- "Can the admin view focus on real SMKN 13 governance (jurusan quotas, teacher curations, DUDI verification) instead of backend database schema?"
