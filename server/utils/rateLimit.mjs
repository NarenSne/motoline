export const rateLimit = ({ windowMs, max }) => {
  const hits = new Map();

  return (req, res, next) => {
    const key = (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || req.ip;
    const now = Date.now();

    if (hits.size > 5000) {
      for (const [k, v] of hits) if (v.reset < now) hits.delete(k);
    }

    const record = hits.get(key);
    if (!record || record.reset < now) {
      hits.set(key, { count: 1, reset: now + windowMs });
      return next();
    }
    if (++record.count > max) {
      res.set("Retry-After", String(Math.ceil((record.reset - now) / 1000)));
      return res.status(429).json({ error: "Too many requests, try again later" });
    }
    next();
  };
};
