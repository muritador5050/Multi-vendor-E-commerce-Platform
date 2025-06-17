// function calculateProfileCompletion(userProfile) {
//   const totalFields = Object.keys(userProfile).length;
//   const completedFields = Object.values(userProfile).filter(
//     (value) => value !== null && value !== undefined && value !== ''
//   ).length;
//   return Math.round((completedFields / totalFields) * 100);
// }

// utils/profileCompletion.js
function calculateProfileCompletion(user) {
  const fields = [
    'fullName',
    'email',
    'phone',
    'profilePhoto',
    'address',
    'gender',
    'dateOfBirth',
    'bio',
    'socialMediaLinks',
  ];

  const totalFields = fields.length;
  let completed = 0;

  fields.forEach((field) => {
    if (Array.isArray(user[field])) {
      if (user[field].length > 0) completed++;
    } else if (user[field]) {
      completed++;
    }
  });

  const percent = Math.round((completed / totalFields) * 100);
  return { percent, completed, totalFields };
}

module.exports = { calculateProfileCompletion };
