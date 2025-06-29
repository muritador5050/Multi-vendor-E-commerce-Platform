const roles = {
  admin: {
    can: ['create', 'edit', 'delete', 'read'],
  },
  vendor: {
    can: ['create', 'edit', 'read'],
  },
  customer: {
    can: ['read'],
  },
};

const checkRole = (allowedRoles, action) => {
  return (req, res, next) => {
    const userRole = req.user.role;

    if (!allowedRoles.includes(userRole)) {
      return res
        .status(403)
        .json({ message: 'Access Denied: Role not allowed' });
    }

    const permissions = roles[userRole]?.can || [];

    if (permissions.includes(action)) {
      return next();
    }

    return res
      .status(403)
      .json({ message: 'Access Denied: Action not permitted' });
  };
};

module.exports = checkRole;
