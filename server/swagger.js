const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Shopping-app API',
      version: '1.0.0',
      description: 'A comprehensive ecommerce backend API',
      contact: {
        name: 'Abdulazeez Muritador',
        email: 'muritador5050@gmail.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:8000/api',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./routes/**/*.js', './models/**/*.js', './docs/*.js'], // Path to files with API docs
};

const specs = swaggerJSDoc(options);

module.exports = { specs, swaggerUi };
