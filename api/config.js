module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({
    stripePublishableKey:
      process.env.DEALCHECK_STRIPE_PK ||
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
      null,
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || null,
    metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID || null
  });
};
