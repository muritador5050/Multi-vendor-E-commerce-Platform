const { PORT } = require('./configs');
const app = require('../app');

//Server
app.listen(PORT, () => {
  console.log(`App listening on the port ${PORT}`);
});
