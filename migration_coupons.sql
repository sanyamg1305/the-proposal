-- ==============================================================================
-- Date Coupons Table Migration
-- ==============================================================================
-- Run this in your Supabase SQL Editor to enable Digital Scratch-Off Date Coupons

create table if not exists public.date_coupons (
    id uuid default gen_random_uuid() primary key,
    title text not null,
    description text not null,
    hint text default null,
    icon text not null default '🎫',
    is_scratched boolean not null default false,
    is_redeemed boolean not null default false,
    redeemed_at timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.date_coupons add column if not exists hint text default null;

-- Enable RLS & open policies
alter table public.date_coupons enable row level security;

drop policy if exists "Allow public read on date_coupons" on public.date_coupons;
create policy "Allow public read on date_coupons" on public.date_coupons for select using (true);

drop policy if exists "Allow public insert on date_coupons" on public.date_coupons;
create policy "Allow public insert on date_coupons" on public.date_coupons for insert with check (true);

drop policy if exists "Allow public update on date_coupons" on public.date_coupons;
create policy "Allow public update on date_coupons" on public.date_coupons for update using (true);

drop policy if exists "Allow public delete on date_coupons" on public.date_coupons;
create policy "Allow public delete on date_coupons" on public.date_coupons for delete using (true);

-- Enable Realtime
do $$
begin
    if not exists (
        select 1 from pg_publication_tables 
        where pubname = 'supabase_realtime' and tablename = 'date_coupons'
    ) then
        alter publication supabase_realtime add table public.date_coupons;
    end if;
end $$;

-- Seed the 5 special coupons (if table is empty)
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
