function calculateProfileCompletion(user) {
  const fields = ['name', 'email', 'phone', 'avatar', 'address'];

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
