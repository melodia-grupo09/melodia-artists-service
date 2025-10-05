# Melodia Artists Service

![Build Status](https://img.shields.io/badge/build-passing-brightgreen) [![codecov](https://codecov.io/gh/melodia-grupo09/melodia-artists-service/graph/badge.svg?token=6NMY5QBHL1)](https://codecov.io/gh/melodia-grupo09/melodia-artists-service) ![node](https://img.shields.io/badge/node->=18.0.0-brightgreen) ![nestjs](https://img.shields.io/badge/nestjs-10.0-red) ![typescript](https://img.shields.io/badge/typescript-5.1-blue) ![cloudinary](https://img.shields.io/badge/cloudinary-2.0-blue)

A microservice for managing artists in the Melodia music platform. This service handles artist profiles, image uploads, and provides a RESTful API for artist operations.

## 🚀 Live Deployment

The application is deployed on Heroku and accessible at:
**https://melodia-artists-64869ccb2e15.herokuapp.com/**

## 📚 API Documentation

The complete API documentation is available through Swagger UI:

**🔗 [Interactive API Documentation](https://melodia-artists-64869ccb2e15.herokuapp.com/api)**

## 📊 Code Coverage

[![codecov](https://codecov.io/gh/melodia-grupo09/melodia-artists-service/graphs/sunburst.svg?token=6NMY5QBHL1)](https://codecov.io/gh/melodia-grupo09/melodia-artists-service)

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
