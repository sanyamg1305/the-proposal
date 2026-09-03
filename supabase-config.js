// ==============================================================================
// Supabase Configuration for Himi & Sanyam Bucket List
// ==============================================================================

// Hardcoded fallback (optional if using Vercel Environment Variables)
const DEFAULT_SUPABASE_URL = '';
const DEFAULT_SUPABASE_ANON_KEY = '';

let _supabaseClient = null;
let _config = null;

// Read config from /api/config (Vercel env vars), localStorage, or hardcoded constants
async function resolveSupabaseConfig() {
    if (_config) return _config;

    // 1. Try Vercel Serverless endpoint /api/config
    try {
        const response = await fetch('/api/config');
        if (response.ok) {
            const data = await response.json();
            if (data.url && data.anonKey && data.url.startsWith('http')) {
                _config = { url: data.url.trim(), anonKey: data.anonKey.trim() };
                return _config;
            }
        }
    } catch (e) {
        // Local preview or non-Vercel environment
    }

    // 2. Try localStorage
    try {
        const storedUrl = localStorage.getItem('supabase_project_url');
        const storedKey = localStorage.getItem('supabase_anon_key');
        if (storedUrl && storedKey && storedUrl.startsWith('http')) {
            _config = { url: storedUrl.trim(), anonKey: storedKey.trim() };
            return _config;
        }
    } catch (e) {
        console.warn('localStorage access error:', e);
    }

    // 3. Fallback to hardcoded constants
    if (DEFAULT_SUPABASE_URL && DEFAULT_SUPABASE_ANON_KEY && DEFAULT_SUPABASE_URL.startsWith('http')) {
        _config = { url: DEFAULT_SUPABASE_URL.trim(), anonKey: DEFAULT_SUPABASE_ANON_KEY.trim() };
        return _config;
    }

    return null;
}

// Asynchronously initialize Supabase client
async function getSupabaseClient() {
    if (_supabaseClient) return _supabaseClient;

    const config = await resolveSupabaseConfig();
    if (!config || !window.supabase) {
        return null;
    }

    _supabaseClient = window.supabase.createClient(config.url, config.anonKey);
    return _supabaseClient;
}

// Synchronous access if already resolved
function initSupabase() {
    return _supabaseClient;
}
