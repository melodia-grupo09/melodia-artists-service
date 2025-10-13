# Melodía Artists Service

<a href="https://github.com/melodia-grupo09/melodia-artists-service/actions/workflows/ci-cd.yml" target="_blank">
  <img src="https://img.shields.io/github/actions/workflow/status/melodia-grupo09/melodia-artists-service/ci-cd.yml?branch=master&label=CI%2FCD%20Pipeline" alt="CI/CD Status" />
</a>
<a href="https://app.codecov.io/github/melodia-grupo09/melodia-artists-service" target="_blank">
  <img src="https://codecov.io/gh/melodia-grupo09/melodia-artists-service/graph/badge.svg?token=6NMY5QBHL1" alt="Coverage Status" />
</a>
<a href="https://nodejs.org" target="_blank">
  <img src="https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg" alt="Node.js Version" />
</a>
<a href="https://nestjs.com" target="_blank">
  <img src="https://img.shields.io/badge/NestJS-10.0-E0234E.svg" alt="NestJS Version" />
</a>
<a href="https://www.typescriptlang.org" target="_blank">
  <img src="https://img.shields.io/badge/TypeScript-5.1-007ACC.svg" alt="TypeScript Version" />
</a>
<a href="https://cloudinary.com" target="_blank">
  <img src="https://img.shields.io/badge/Cloudinary-2.0-3448C5.svg" alt="Cloudinary Version" />
</a>

Microservice for managing artists built with [**NestJS**](https://nestjs.com/) for the Melodía application.

## Live Deployment

The application is deployed on Heroku and accessible at: [https://melodia-artists-64869ccb2e15.herokuapp.com/](https://melodia-artists-64869ccb2e15.herokuapp.com/)

## Overview

This Artists Service serves as a dedicated microservice for the Melodía platform, providing:

- **Artist Profile Management**: Complete CRUD operations for artist data and releases

## Architecture

Key architectural components specific to this service:

- **Upload Module**: The images are stored in Cloudinary and the Urls of said images are stored in the Service Database

## API Documentation

For comprehensive API documentation, including all endpoints, request/response schemas:

**[Interactive API Documentation](https://melodia-artists-64869ccb2e15.herokuapp.com/api)**

## Code Coverage

Comprehensive test coverage tracked automatically via Codecov:

[![Test Coverage](https://codecov.io/gh/melodia-grupo09/melodia-artists-service/graph/badge.svg?token=6NMY5QBHL1)](https://codecov.io/gh/melodia-grupo09/melodia-artists-service)

**[View Detailed Coverage Report & Interactive Graphs](https://app.codecov.io/gh/melodia-grupo09/melodia-artists-service)**

<h3>Graph</h3>
<div align="center">
  
  <a href="https://app.codecov.io/gh/melodia-grupo09/melodia-artists-service" target="_blank">
    <img src="https://codecov.io/gh/melodia-grupo09/melodia-artists-service/graphs/sunburst.svg?token=6NMY5QBHL1" alt="Coverage Sunburst" width="400" />
  </a>
  
</div>

## Dependencies

### Core Services

- **Cloudinary**: Cloud-based image storage with automatic optimization and transformation
- **TypeORM**: Object-relational mapping for PostgreSQL with complex entity relationships
- **Multer**: File upload middleware for handling multipart/form-data

### Development & Testing

- **Jest**: Testing framework with comprehensive mocking for file upload testing
- **ESLint**: Code quality and style enforcement
- **class-validator**: Advanced DTO validation for file uploads and artist data
- **TypeScript**: Type safety and enhanced developer experience
