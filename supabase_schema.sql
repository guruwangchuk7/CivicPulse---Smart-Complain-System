-- Create Tables
create table if not exists reports (
  id uuid default gen_random_uuid() primary key,
  user_id uuid, -- Can be auth.uid() or client-generated UUID
  category text not null, -- 'POTHOLE', 'TRASH', 'HAZARD', 'OTHER' validation in app or constraint here
  description text,
  lat double precision not null,
  lng double precision not null,
  photo_url text,
  status text default 'OPEN' check (status in ('OPEN', 'IN_PROGRESS', 'RESOLVED')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists votes (
  id uuid default gen_random_uuid() primary key,
  report_id uuid references reports(id) on delete cascade not null,
  user_id uuid not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, report_id)
);

-- Enable RLS (Row Level Security) - Permissive for Hackathon
alter table reports enable row level security;
create policy "Enable read access for all users" on reports for select using (true);
create policy "Enable insert access for all users" on reports for insert with check (true);
create policy "Enable update for all users" on reports for update using (true); -- To allow upvote count updates if denormalized, or status updates

alter table votes enable row level security;
create policy "Enable read access for all users" on votes for select using (true);
create policy "Enable insert access for all users" on votes for insert with check (true);

-- Storage bucket setup (You must create 'photos' bucket in Supabase Dashboard)
-- Policy for storage: Give public read access, and authenticated/public insert access.
