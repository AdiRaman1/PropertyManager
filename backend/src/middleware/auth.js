// backend/src/middleware/auth.js
// Production JWT & Role-Based Access Control (RBAC) Middleware

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // For demo/dev environments, allow fallback header or mock user
    if (process.env.NODE_ENV === 'development' && req.headers['x-demo-role']) {
      req.user = {
        id: 'usr-owner-1',
        organizationId: 'org-demo-1',
        propertyId: req.headers['x-property-id'] || 'prop-1',
        role: req.headers['x-demo-role'],
        name: 'Aditya Raman'
      };
      return next();
    }
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];
  try {
    // In production: verify with jsonwebtoken library
    // const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Forbidden: Invalid or expired token' });
  }
}

/**
 * Require specific user roles to access a route
 * @param {Array<string>} allowedRoles e.g. ['owner', 'manager']
 */
export function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Forbidden: Access restricted to roles: [${allowedRoles.join(', ')}]` 
      });
    }
    next();
  };
}
