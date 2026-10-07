-- ==============================================================================
-- Monopoly Deal: Date Edition Table Migration
-- ==============================================================================
-- Run this in your Supabase SQL Editor to enable real-time cross-device Monopoly Deal gameplay

create table if not exists public.monopoly_games (
    id text primary key, -- room code e.g. 'HIMI', 'SANYAM', 'LOVE'
    deck jsonb not null default '[]'::jsonb,
    discard_pile jsonb not null default '[]'::jsonb,
    player1_id text not null default 'Sanyam',
    player2_id text default 'Himi',
    player1_hand jsonb not null default '[]'::jsonb,
    player2_hand jsonb not null default '[]'::jsonb,
    player1_bank jsonb not null default '[]'::jsonb,
    player2_bank jsonb not null default '[]'::jsonb,
    player1_properties jsonb not null default '{}'::jsonb,
    player2_properties jsonb not null default '{}'::jsonb,
    current_turn text not null default 'player1',
    plays_remaining integer not null default 3,
    turn_phase text not null default 'play', -- 'play' | 'discard' | 'waiting_defense' | 'waiting_payment'
    pending_action jsonb default null, -- details of pending action requiring opponent response
    last_move jsonb default null,
    winner text default null,
    target_sets integer not null default 3,
    reactions jsonb default '[]'::jsonb,
    status text not null default 'active',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS & open policies for players
alter table public.monopoly_games enable row level security;

drop policy if exists "Allow public read on monopoly_games" on public.monopoly_games;
create policy "Allow public read on monopoly_games" on public.monopoly_games for select using (true);

drop policy if exists "Allow public insert on monopoly_games" on public.monopoly_games;
create policy "Allow public insert on monopoly_games" on public.monopoly_games for insert with check (true);

drop policy if exists "Allow public update on monopoly_games" on public.monopoly_games;
create policy "Allow public update on monopoly_games" on public.monopoly_games for update using (true);

drop policy if exists "Allow public delete on monopoly_games" on public.monopoly_games;
create policy "Allow public delete on monopoly_games" on public.monopoly_games for delete using (true);

-- Enable Realtime
do $$
begin
    if not exists (
        select 1 from pg_publication_tables 
        where pubname = 'supabase_realtime' and tablename = 'monopoly_games'
    ) then
        alter publication supabase_realtime add table public.monopoly_games;
    end if;
end $$;
