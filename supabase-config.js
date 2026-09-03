// ==============================================================================
// Supabase Configuration for Himi & Sanyam Bucket List
// ==============================================================================

// Option 1: Paste your Supabase project credentials directly here
const DEFAULT_SUPABASE_URL = ''; // e.g. 'https://xyzcompany.supabase.co'
const DEFAULT_SUPABASE_ANON_KEY = ''; // e.g. 'eyJhbGciOiJIUzI1NiIsInR5cCI6...'

// Check if credentials exist in localStorage (allows setting via the web UI without editing code)
const getStoredConfig = () => {
    try {
        const storedUrl = localStorage.getItem('supabase_project_url');
        const storedKey = localStorage.getItem('supabase_anon_key');
        if (storedUrl && storedKey) {
            return { url: storedUrl, anonKey: storedKey };
        }
    } catch (e) {
        console.warn('localStorage access failed:', e);
    }
    return {
        url: DEFAULT_SUPABASE_URL,
        anonKey: DEFAULT_SUPABASE_ANON_KEY
    };
};

let _supabaseClient = null;

function initSupabase() {
    const config = getStoredConfig();
    const hasValidConfig = config.url && 
                           config.anonKey && 
                           config.url.startsWith('http') && 
                           !config.url.includes('YOUR_SUPABASE');

    if (!hasValidConfig) {
        return null;
    }

    if (!_supabaseClient && window.supabase) {
        _supabaseClient = window.supabase.createClient(config.url, config.anonKey);
    }
    return _supabaseClient;
}

function saveSupabaseCredentials(url, anonKey) {
    if (!url || !anonKey) return false;
    localStorage.setItem('supabase_project_url', url.trim());
    localStorage.setItem('supabase_anon_key', anonKey.trim());
    _supabaseClient = null; // force re-initialization
    return initSupabase();
}

function isSupabaseConfigured() {
    const config = getStoredConfig();
    return !!(config.url && config.anonKey && config.url.startsWith('http') && !config.url.includes('YOUR_SUPABASE'));
}
