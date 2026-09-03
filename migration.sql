-- ==============================================================================
-- Additional Migration Script for Recurring Rituals
-- ==============================================================================
-- Run this snippet in your Supabase SQL Editor if you already ran the first schema.

-- 1. Add recurring columns to existing bucket_list table
alter table public.bucket_list add column if not exists is_recurring boolean not null default false;
alter table public.bucket_list add column if not exists recurrence_interval text default null;
alter table public.bucket_list add column if not exists completion_count integer not null default 0;

-- 2. Insert starter recurring rituals
insert into public.bucket_list (title, category, is_completed, is_recurring, recurrence_interval, completion_count)
values
    ('Weekly beach date to recharge our batteries 🏖️🔋', 'Beach', false, true, 'Weekly', 0),
    ('Daily goofy face & smile check across the office 🏢😂', 'Office', false, true, 'Daily', 0),
    ('Remind Himi to take medicines & wear glasses without complaining 💊👓', 'Office', false, true, 'Daily', 0),
    ('Monthly cozy bookstore & new coffee shop date 📚☕', 'Cozy', false, true, 'Monthly', 0);
