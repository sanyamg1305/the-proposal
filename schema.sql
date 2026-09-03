-- ==============================================================================
-- Himi & Sanyam Bucket List - Supabase Schema
-- ==============================================================================
-- Run this script in the Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Create the bucket_list table
create table if not exists public.bucket_list (
    id uuid default gen_random_uuid() primary key,
    title text not null,
    category text not null default 'General',
    is_completed boolean not null default false,
    completed_at timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable Row Level Security (RLS)
alter table public.bucket_list enable row level security;

-- 3. RLS Policies: Allow public read, insert, update, and delete
create policy "Allow public read on bucket_list"
    on public.bucket_list for select
    using (true);

create policy "Allow public insert on bucket_list"
    on public.bucket_list for insert
    with check (true);

create policy "Allow public update on bucket_list"
    on public.bucket_list for update
    using (true);

create policy "Allow public delete on bucket_list"
    on public.bucket_list for delete
    using (true);

-- 4. Enable Realtime for the bucket_list table
alter publication supabase_realtime add table public.bucket_list;

-- 5. Insert starter bucket list items (if table is currently empty)
insert into public.bucket_list (title, category, is_completed)
select * from (values
    ('Watch a beach sunset together until the stars come out', 'Beach', false),
    ('A weekend beach getaway with zero office stress', 'Beach', false),
    ('Late night beach drive with good music & windows down', 'Beach', false),
    ('Undercover office coffee date without anyone noticing', 'Office', false),
    ('Get Himi to take her medicines & wear her glasses without making a funny face 😂', 'Office', false),
    ('Have a peaceful lunch date without rushing back to work', 'Office', false),
    ('Bookstore date where we pick out books for each other', 'Cozy', false),
    ('Rainy day movie marathon with hot chocolate & blankets', 'Cozy', false),
    ('Cook a chaotic and delicious dinner together from scratch', 'Cozy', false),
    ('Take goofy photobooth pictures together', 'Cozy', false),
    ('Our first flight & trip together to a brand new city', 'Adventure', false),
    ('Fill a memory scrapbook with our tickets, notes, and photos', 'Adventure', false)
) as initial_data(title, category, is_completed)
where not exists (select 1 from public.bucket_list limit 1);
