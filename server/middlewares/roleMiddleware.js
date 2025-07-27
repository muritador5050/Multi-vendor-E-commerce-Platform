const roles = {
  admin: { can: ['create', 'edit', 'delete', 'read'] },
  vendor: { can: ['create', 'edit', 'read', 'delete'] },
  customer: { can: ['read'] },
};

const checkRole = (allowedRoles, action) => {
  return (req, res, next) => {
    if (typeof allowedRoles === 'string') {
      allowedRoles = [allowedRoles];
    }

    if (!req.user?.role) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: 'Access Denied: Role not allowed' });
    }

    if (action) {
      const permissions = roles[req.user.role]?.can || [];
      if (!permissions.includes(action)) {
        return res.status(403).json({ message: 'Action not permitted' });
      }
    }

    next();
  };
};

module.exports = checkRole;
