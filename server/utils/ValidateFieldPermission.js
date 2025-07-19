const PROTECTED_FIELDS = {
  // Admin-only fields
  role: ['admin'],
  isActive: ['admin'],
  email: ['admin'],
  isEmailVerified: ['admin'],

  // System-only fields (no one can modify)
  tokenVersion: [],
  emailVerificationToken: [],
  emailVerificationExpires: [],
  resetPasswordToken: [],
  resetPasswordExpires: [],
  refreshToken: [],
  googleId: [],
  facebookId: [],
  profileCompletion: [],
  createdAt: [],
  updatedAt: [],
  _id: [],
  __v: [],
};

function validateFieldPermissions(requestBody, userRole) {
  const forbiddenFields = [];

  Object.keys(requestBody).forEach((field) => {
    if (PROTECTED_FIELDS.hasOwnProperty(field)) {
      const allowedRoles = PROTECTED_FIELDS[field];

      // System-only fields (empty array)
      if (allowedRoles.length === 0) {
        forbiddenFields.push(field);
        return;
      }

      // Check if user role is allowed
      if (!allowedRoles.includes(userRole)) {
        forbiddenFields.push(field);
      }
    }
  });

  return {
    isValid: forbiddenFields.length === 0,
    forbiddenFields,
  };
}

function getFilteredUpdateData(requestBody, userRole) {
  const filteredData = {};

  Object.keys(requestBody).forEach((field) => {
    // Skip protected fields that user can't modify
    if (PROTECTED_FIELDS.hasOwnProperty(field)) {
      const allowedRoles = PROTECTED_FIELDS[field];

      // Skip system-only fields
      if (allowedRoles.length === 0) {
        return;
      }

      // Skip if user role not allowed
      if (!allowedRoles.includes(userRole)) {
        return;
      }
    }

    // Include the field
    filteredData[field] = requestBody[field];
  });

  return filteredData;
}

module.exports = { validateFieldPermissions, getFilteredUpdateData };
