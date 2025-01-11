import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CryOutNow API Documentation',
      version: '1.0.0',
      description: 'API documentation for CryOutNow - A Prayer Chain Application',
      contact: {
        name: 'CryOutNow Support',
        url: 'https://cryoutnow.com/support',
      },
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3000',
        description: 'Development Server',
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
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/models/*.ts'], // Path to the API routes and models
};

export const swaggerSpec = swaggerJsdoc(options); 