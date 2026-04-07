create extension if not exists vector;

create table if not exists persona_identity_profiles (
  id uuid primary key default gen_random_uuid(),
  persona_id uuid not null references personas(id) on delete cascade,
  user_id uuid not null references auth.users(id),

  primary_reference_image_url text not null,
  secondary_reference_image_url text,
  video_safe_reference_image_url text,

  canonical_face_image_url text,
  canonical_face_crop_url text,
  canonical_face_aligned_url text,
  face_bbox jsonb,
  landmarks jsonb,

  embedding_vector vector(512),
  embedding_model text not null default 'arcface-r100',
  embedding_model_version text not null default 'v1',
  embedding_status text not null default 'pending'
    check (embedding_status in ('pending','processing','ready','failed')),

  face_quality_score numeric(4,3),
  reference_set_version uuid not null default gen_random_uuid(),

  identity_threshold_image numeric(4,3) default 0.78,
  identity_threshold_video numeric(4,3) default 0.72,

  allure_profile jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_persona_identity_profiles_persona_id
  on persona_identity_profiles(persona_id);

create index if not exists idx_persona_identity_profiles_embedding_vector
  on persona_identity_profiles
  using ivfflat (embedding_vector vector_cosine_ops);

create table if not exists generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  persona_id uuid not null references personas(id),
  plan text not null check (plan in ('pro','creator','agency')),
  content_type text not null check (content_type in ('post','story','reel')),

  shot_preset_id text not null,
  prompt text,
  identity_lock boolean not null default false,
  allure_mode boolean not null default true,
  reference_set_version uuid not null,

  candidate_count integer not null,
  motion_level text check (motion_level in ('low','medium')),

  selected_candidate_index integer,
  selected_asset_url text,
  identity_score numeric(4,3),
  allure_score numeric(4,3),
  quality_score numeric(4,3),
  final_score numeric(4,3),

  video_consistency_score numeric(4,3),
  used_repair_pass boolean default false,
  repair_attempts integer default 0,

  status text not null default 'queued'
    check (
      status in (
        'queued',
        'reference_resolving',
        'generating',
        'scoring',
        'selecting',
        'video_generating',
        'drift_auditing',
        'repairing',
        'completed',
        'failed',
        'rejected'
      )
    ),
  rejection_reason text,
  failure_details jsonb,
  processing_started_at timestamptz,
  processing_completed_at timestamptz,

  trace_url text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_generations_user_id_created_at
  on generations(user_id, created_at desc);

create index if not exists idx_generations_persona_id
  on generations(persona_id);

create index if not exists idx_generations_active_status
  on generations(status)
  where status not in ('completed','failed','rejected');

create table if not exists generation_candidates (
  id uuid primary key default gen_random_uuid(),
  generation_id uuid not null references generations(id) on delete cascade,
  candidate_index integer not null,
  asset_url text not null,

  identity_score numeric(4,3),
  allure_score numeric(4,3),
  quality_score numeric(4,3),
  prompt_score numeric(4,3),
  final_score numeric(4,3),

  face_detected boolean default false,
  face_bbox jsonb,

  selected boolean not null default false,
  rejection_reason text,

  repair_applied boolean default false,
  repair_reason text,

  created_at timestamptz not null default now()
);

create index if not exists idx_generation_candidates_generation_id
  on generation_candidates(generation_id);

create table if not exists generation_video_frames (
  id uuid primary key default gen_random_uuid(),
  generation_id uuid not null references generations(id) on delete cascade,
  frame_index integer not null,
  frame_position numeric(4,3),
  frame_url text not null,
  identity_score numeric(4,3),
  quality_score numeric(4,3),
  drift_score numeric(4,3),
  passed_threshold boolean,
  created_at timestamptz not null default now()
);

create table if not exists generation_events (
  id uuid primary key default gen_random_uuid(),
  generation_id uuid not null references generations(id) on delete cascade,
  event_type text not null,
  event_data jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_generation_events_generation_id_created_at
  on generation_events(generation_id, created_at);
