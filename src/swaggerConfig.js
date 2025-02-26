import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';


dotenv.config();

const options = {
  definition: {
    openapi   : '3.0.0',
    info      : {
      title      : 'Task Manager API',
      version    : '1.0.0',
      description: 'API documentation for Task Manager App',
    },
    servers   : [
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type        : 'http',
          scheme      : 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security  : [{bearerAuth: []}],
  },
  apis      : ['./src/routes/*.js'], // 📌
};

const swaggerSpec = swaggerJSDoc(options);

const setupSwagger = (app) =>
  {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  };

export default setupSwagger;
