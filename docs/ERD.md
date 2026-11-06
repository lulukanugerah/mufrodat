# Mufrodat Kids — ERD

```mermaid
erDiagram
  ADMIN_PROFILES {
    uuid user_id PK
    text display_name
    timestamptz created_at
  }
  CATEGORIES {
    uuid id PK
    text slug UK
    text title
    text description
    text emoji
    text color
    int sort_order
    boolean is_published
  }
  VOCABULARY {
    uuid id PK
    uuid category_id FK
    text arabic
    text transliteration
    text meaning
    text image_path
    text audio_path
    text image_emoji
    int sort_order
    boolean is_published
  }
  ACTIVITIES {
    uuid id PK
    uuid category_id FK
    text slug UK
    text title
    text description
    text game_type
    boolean is_published
  }
  ACTIVITY_ITEMS {
    uuid id PK
    uuid activity_id FK
    uuid vocabulary_id FK
    int points
    int sort_order
  }
  GUEST_SESSIONS {
    uuid id PK
    text display_name
    text class_label
    text session_token_hash UK
    timestamptz created_at
    timestamptz last_seen_at
  }
  ATTEMPTS {
    uuid id PK
    uuid guest_session_id FK
    uuid activity_id FK
    int score
    int max_score
    int correct_count
    int total_items
    int mistakes
    int duration_seconds
    timestamptz created_at
  }
  ATTEMPT_ANSWERS {
    uuid id PK
    uuid attempt_id FK
    uuid activity_item_id FK
    uuid selected_vocabulary_id FK
    boolean is_correct
    int earned_points
  }

  CATEGORIES ||--o{ VOCABULARY : contains
  CATEGORIES ||--o{ ACTIVITIES : has
  ACTIVITIES ||--o{ ACTIVITY_ITEMS : contains
  VOCABULARY ||--o{ ACTIVITY_ITEMS : used_in
  GUEST_SESSIONS ||--o{ ATTEMPTS : creates
  ACTIVITIES ||--o{ ATTEMPTS : receives
  ATTEMPTS ||--o{ ATTEMPT_ANSWERS : contains
  ACTIVITY_ITEMS ||--o{ ATTEMPT_ANSWERS : answered
  VOCABULARY ||--o{ ATTEMPT_ANSWERS : selected
```

## Security model

- Admin memakai Supabase Auth dan harus memiliki baris pada `admin_profiles`.
- Konten yang berstatus `is_published = true` dapat dibaca publik.
- Mutasi kategori, kosakata, permainan, dan media hanya dapat dilakukan admin.
- Guest session dan hasil permainan tidak memiliki kebijakan baca/tulis publik.
- Next.js Route Handler menggunakan service role hanya di server, memverifikasi hash token guest, mengambil kunci jawaban dari `activity_items`, lalu menghitung skor.
- `session_token_hash` disimpan di database. Token asli hanya dikirim ke browser pembuat sesi.

## Catatan desain

Mode guest menyimpan identitas pada browser. Satu siswa dapat menggunakan nama panggilan yang sama di sesi berbeda. Untuk laporan yang dapat dikenali lintas perangkat, aplikasi perlu beralih ke akun siswa atau kode akses yang dikelola guru.
