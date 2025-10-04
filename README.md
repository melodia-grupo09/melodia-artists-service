# Melodia Artists Service

A microservice for managing artists in the Melodia music platform. This service handles artist profiles, image uploads, and provides a RESTful API for artist operations.

## 🚀 Live Deployment

The application is deployed on Heroku and accessible at:
**https://melodia-artists-64869ccb2e15.herokuapp.com/**

## 📚 API Documentation

The complete API documentation is available through Swagger UI:

**🔗 [Interactive API Documentation](https://melodia-artists-64869ccb2e15.herokuapp.com/api)**

### Base URL
```
https://melodia-artists-64869ccb2e15.herokuapp.com/
```


## 🛠 Technology Stack

- **Framework**: NestJS (Node.js)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **File Images Storage**: Cloudinary
- **Deployment**: Heroku
- **Validation**: class-validator
- **File Upload**: Multer
- **API Documentation**: Swagger/OpenAPI

## 🏗 Architecture

The service follows a clean architecture pattern with:

- **Controllers**: Handle HTTP requests and responses
- **Services**: Business logic implementation
- **Entities**: Database models using TypeORM
- **DTOs**: Data Transfer Objects for validation
- **Upload Module**: File handling with Cloudinary integration