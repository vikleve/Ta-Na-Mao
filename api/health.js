// Vercel Serverless Function: Health Check & Environment Status
module.exports = async (req, res) => {
  const hasDbUrl = Boolean(process.env.SUPABASE_URL);
  const hasDbKey = Boolean(process.env.SUPABASE_ANON_KEY);

  return res.status(200).json({
    status: 'ok',
    project: 'Tá na Mão',
    version: '2.0.0',
    platform: 'Vercel Serverless',
    timestamp: new Date().toISOString(),
    databaseConfigured: hasDbUrl && hasDbKey,
    environment: process.env.NODE_ENV || 'production'
  });
};
