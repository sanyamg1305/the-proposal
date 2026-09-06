-- ==============================================================================
-- Himi & Sanyam Bucket List & Recurring Rituals - Supabase Schema
-- ==============================================================================
-- Run this script in the Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Create the bucket_list table (or add columns if already exists)
create table if not exists public.bucket_list (
    id uuid default gen_random_uuid() primary key,
    title text not null,
    category text not null default 'General',
    is_completed boolean not null default false,
    is_recurring boolean not null default false,
    recurrence_interval text default null, -- 'Daily', 'Weekly', 'Monthly'
    completion_count integer not null default 0,
    completed_at timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Migration safety: in case the table was already created in a previous step
alter table public.bucket_list add column if not exists is_recurring boolean not null default false;
alter table public.bucket_list add column if not exists recurrence_interval text default null;
alter table public.bucket_list add column if not exists completion_count integer not null default 0;

-- 2. Enable Row Level Security (RLS)
alter table public.bucket_list enable row level security;

-- 3. RLS Policies: Allow public read, insert, update, and delete
drop policy if exists "Allow public read on bucket_list" on public.bucket_list;
create policy "Allow public read on bucket_list" on public.bucket_list for select using (true);

drop policy if exists "Allow public insert on bucket_list" on public.bucket_list;
create policy "Allow public insert on bucket_list" on public.bucket_list for insert with check (true);

drop policy if exists "Allow public update on bucket_list" on public.bucket_list;
create policy "Allow public update on bucket_list" on public.bucket_list for update using (true);

drop policy if exists "Allow public delete on bucket_list" on public.bucket_list;
create policy "Allow public delete on bucket_list" on public.bucket_list for delete using (true);

-- 4. Enable Realtime for the bucket_list table
do $$
begin
    if not exists (
        select 1 from pg_publication_tables 
        where pubname = 'supabase_realtime' and tablename = 'bucket_list'
    ) then
        alter publication supabase_realtime add table public.bucket_list;
    end if;
end $$;

-- 5. Insert starter bucket list items and recurring rituals (if table is empty)
insert into public.bucket_list (title, category, is_completed, is_recurring, recurrence_interval, completion_count)
select * from (values
    -- One-time bucket list memories
    ('Watch a beach sunset together until the stars come out', 'Beach', false, false, null, 0),
    ('A weekend beach getaway with zero office stress', 'Beach', false, false, null, 0),
    ('Late night beach drive with good music & windows down', 'Beach', false, false, null, 0),
    ('Undercover office coffee date without anyone noticing', 'Office', false, false, null, 0),
    ('Have a peaceful lunch date without rushing back to work', 'Office', false, false, null, 0),
    ('Bookstore date where we pick out books for each other', 'Cozy', false, false, null, 0),
    ('Rainy day movie marathon with hot chocolate & blankets', 'Cozy', false, false, null, 0),
    ('Cook a chaotic and delicious dinner together from scratch', 'Cozy', false, false, null, 0),
    ('Take goofy photobooth pictures together', 'Cozy', false, false, null, 0),
    ('Our first flight & trip together to a brand new city', 'Adventure', false, false, null, 0),
    ('Fill a memory scrapbook with our tickets, notes, and photos', 'Adventure', false, false, null, 0),
    ('Take a spontaneous day off together with zero plans', 'General', false, false, null, 0),
    ('Write each other love letters to open on our anniversary', 'General', false, false, null, 0),

    -- Recurring couple rituals & habits
    ('Weekly beach date to recharge our batteries 🏖️🔋', 'Beach', false, true, 'Weekly', 0),
    ('Daily goofy face & smile check across the office 🏢😂', 'Office', false, true, 'Daily', 0),
    ('Remind Himi to take medicines & wear glasses without complaining 💊👓', 'Office', false, true, 'Daily', 0),
    ('Monthly cozy bookstore & new coffee shop date 📚☕', 'Cozy', false, true, 'Monthly', 0)
) as initial_data(title, category, is_completed, is_recurring, recurrence_interval, completion_count)
where not exists (select 1 from public.bucket_list limit 1);

-- ==============================================================================
-- 6. Date Coupons Table & Policies
-- ==============================================================================
create table if not exists public.date_coupons (
    id uuid default gen_random_uuid() primary key,
    title text not null,
    description text not null,
    icon text not null default '🎫',
    is_scratched boolean not null default false,
    is_redeemed boolean not null default false,
    redeemed_at timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.date_coupons enable row level security;

drop policy if exists "Allow public read on date_coupons" on public.date_coupons;
create policy "Allow public read on date_coupons" on public.date_coupons for select using (true);

drop policy if exists "Allow public insert on date_coupons" on public.date_coupons;
create policy "Allow public insert on date_coupons" on public.date_coupons for insert with check (true);

drop policy if exists "Allow public update on date_coupons" on public.date_coupons;
create policy "Allow public update on date_coupons" on public.date_coupons for update using (true);

drop policy if exists "Allow public delete on date_coupons" on public.date_coupons;
create policy "Allow public delete on date_coupons" on public.date_coupons for delete using (true);

do $$
begin
    if not exists (
        select 1 from pg_publication_tables 
        where pubname = 'supabase_realtime' and tablename = 'date_coupons'
    ) then
        alter publication supabase_realtime add table public.date_coupons;
    end if;
end $$;

insert into public.date_coupons (title, description, icon, is_scratched, is_redeemed)
select * from (values
    ('One spontaneous sunset beach run with ice cream', 'Redeemable for one immediate sunset escape to the beach with your favorite ice cream in hand 🍦🌅', '🍦', false, false),
    ('Free pass to skip 1 health lecture from Sanyam', 'Total peace & quiet pass: zero comments or lectures about medicines, glasses, or coffee for the whole day! 😂', '🤐', false, false),
    ('Sanyam cooks whatever you want from scratch', 'Chef Sanyam is at your command! Pick whatever meal or dessert your heart desires, cooked completely from scratch 🍳', '🍳', false, false),
    ('Bookstore date: Sanyam buys you any book you pick', 'A cozy bookstore afternoon where Sanyam buys any book that catches your eye, no questions asked 📚', '📚', false, false),
    ('Late night drive with your playlist on blast', 'Windows down, beach breeze, city lights, and your songs playing as loud as you want 🚗💨', '🚗', false, false),
    ('Undercover office coffee delivery by Sanyam', 'Sanyam sneaks to your desk with your favorite iced beverage during a busy workday ☕❤️', '☕', false, false),
    ('Movie night dictator pass: you pick the movie & snacks', 'Full veto power over what we watch and all snacks. Zero complaints allowed from Sanyam! 🎬🍿', '🎬', false, false),
    ('Spontaneous beach picnic with all your favorite treats', 'Blanket on the sand, cool sea breeze, and a picnic basket filled with everything you love 🧺🏖️', '🧺', false, false)
) as initial_coupons(title, description, icon, is_scratched, is_redeemed)
where not exists (select 1 from public.date_coupons limit 1);


