-- ==============================================================================
-- Sequence Board Game Table Migration
-- ==============================================================================
-- Run this in your Supabase SQL Editor to enable real-time cross-device Sequence gameplay

create table if not exists public.sequence_games (
    id text primary key, -- room code e.g. 'HIMI', 'SANYAM', 'LOVE'
    board jsonb not null, -- 10x10 array of spaces: null | 'player1' | 'player2'
    deck jsonb not null, -- array of card codes
    discard_pile jsonb not null default '[]'::jsonb,
    player1_id text not null default 'Sanyam',
    player2_id text default 'Himi',
    player1_hand jsonb not null default '[]'::jsonb,
    player2_hand jsonb not null default '[]'::jsonb,
    current_turn text not null default 'player1',
    target_sequences integer not null default 2,
    player1_sequences integer not null default 0,
    player2_sequences integer not null default 0,
    completed_sequences jsonb not null default '[]'::jsonb,
    last_move jsonb,
    winner text default null,
    reactions jsonb default '[]'::jsonb,
    status text not null default 'waiting',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS & open policies for players
alter table public.sequence_games enable row level security;

drop policy if exists "Allow public read on sequence_games" on public.sequence_games;
create policy "Allow public read on sequence_games" on public.sequence_games for select using (true);

drop policy if exists "Allow public insert on sequence_games" on public.sequence_games;
create policy "Allow public insert on sequence_games" on public.sequence_games for insert with check (true);

drop policy if exists "Allow public update on sequence_games" on public.sequence_games;
create policy "Allow public update on sequence_games" on public.sequence_games for update using (true);

drop policy if exists "Allow public delete on sequence_games" on public.sequence_games;
create policy "Allow public delete on sequence_games" on public.sequence_games for delete using (true);

-- Enable Realtime
do $$
begin
    if not exists (
        select 1 from pg_publication_tables 
        where pubname = 'supabase_realtime' and tablename = 'sequence_games'
    ) then
        alter publication supabase_realtime add table public.sequence_games;
    end if;
end $$;
