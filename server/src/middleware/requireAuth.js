const requireAuth = (req, res, next) => {
  // Placeholder for future auth implementation.
  // In Step 14, this middleware will:
  // 1. read JWT or session
  // 2. verify user identity
  // 3. attach req.user
  // 4. block unauthenticated access

  req.user = null;
  next();
};

module.exports = requireAuth;