/**
 * isAuthenticated
 * Middleware that guards protected API routes.
 * Rejects requests without a valid session.
 */
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  return res.status(401).json({
    success: false,
    message: 'Unauthorized – please log in to access this resource.',
  });
};

module.exports = { isAuthenticated };
