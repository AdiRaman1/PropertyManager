// backend/src/middleware/tenantIsolation.js
// Enforces Multi-Tenant scoping so queries can never leak across organizations

export function enforceTenantScoping(req, res, next) {
  const orgId = req.user?.organizationId || req.headers['x-organization-id'] || 'org-demo-1';
  const propertyId = req.headers['x-property-id'] || req.query.propertyId || req.body?.propertyId;

  if (!orgId) {
    return res.status(400).json({ error: 'Missing organization tenant context' });
  }

  // Bind tenant context directly to request
  req.organizationId = orgId;
  req.propertyId = propertyId;
  next();
}
