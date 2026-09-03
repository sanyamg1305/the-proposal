// Vercel Serverless Function to expose public Supabase credentials to frontend
module.exports = (req, res) => {
    const url = process.env.SUPABASE_URL || 
                process.env.NEXT_PUBLIC_SUPABASE_URL || 
                process.env.VITE_SUPABASE_URL || '';

    const anonKey = process.env.SUPABASE_ANON_KEY || 
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
                    process.env.VITE_SUPABASE_ANON_KEY || '';

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate');
    return res.status(200).json({
        url,
        anonKey
    });
};
