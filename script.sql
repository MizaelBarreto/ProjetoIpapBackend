create table if not exists public.respostas (
  id serial primary key,
  nome text,
  email text,
  consent boolean default false,
  respostas jsonb not null,
  scores jsonb,
  categories jsonb,
  created_at timestamp with time zone default now()
);
