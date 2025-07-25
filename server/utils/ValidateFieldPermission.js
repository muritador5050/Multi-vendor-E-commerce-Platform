const PROTECTED_FIELDS = {
  // Admin-only fields
  role: ['admin'],
  // isActive: ['admin'],
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

module.exports = { getFilteredUpdateData };
