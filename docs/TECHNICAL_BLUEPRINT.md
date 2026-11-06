# Technical Blueprint — Mufrodat Kids

## Product scope

Personal learning application for grade III elementary/Islamic elementary students. One administrator/teacher manages content. Students enter as guests and do not need email accounts.

## Main modules

1. Public learning: home, categories, vocabulary flashcards, Arabic pronunciation.
2. Game engine: click-to-match, shuffled options, feedback, timer, mistake counter, score.
3. Guest session: browser-generated identity is represented by a server-issued UUID and random bearer token.
4. Admin: Supabase Auth login, category management, vocabulary management, activity generation, and recent attempt list.
5. Persistence: Supabase PostgreSQL stores learning content and attempts; Supabase Storage stores image/audio assets.

## Request flows

### Student session

1. Student enters a display name.
2. Browser sends the name to `POST /api/guest/sessions`.
3. Server creates a random 256-bit token, stores its SHA-256 hash, and returns the session UUID and token.
4. Browser keeps the token in localStorage for the active browser profile.

### Game submission

1. Browser sends activity ID, session ID, token, completed pairs, duration, and mistake count to `POST /api/guest/attempts`.
2. Server hashes the token and validates it against the guest session.
3. Server loads the activity items from PostgreSQL.
4. Server verifies every submitted pair against the database answer key.
5. Server computes score and inserts attempt and answer rows.
6. Server returns the score summary.

### Admin content management

1. Admin signs in with Supabase Auth.
2. Next.js server reads the user session from cookies.
3. `requireAdmin()` checks `admin_profiles`.
4. Server Actions write content using the authenticated Supabase client.
5. PostgreSQL RLS and Storage policies enforce admin-only mutations.

## Routes

| Route | Purpose |
|---|---|
| `/` | Landing page |
| `/materi` | Category index |
| `/materi/[slug]` | Vocabulary cards |
| `/permainan` | Game index |
| `/permainan/[slug]` | Matching game |
| `/admin/login` | Admin authentication |
| `/admin` | Content and result dashboard |
| `/api/guest/sessions` | Create guest session |
| `/api/guest/attempts` | Validate and store attempt |

## Environment separation

- `NEXT_PUBLIC_SUPABASE_URL`: public project URL.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: public client key; RLS remains mandatory.
- `SUPABASE_SERVICE_ROLE_KEY`: server-only key used by guest session/attempt Route Handlers. Never expose to browser or commit to Git.

## MVP boundaries

No multi-school tenancy, no permanent student accounts, no class roster, no cross-device guest history, no offline synchronization, no certificates, and no formal assessment-grade export in this MVP.
