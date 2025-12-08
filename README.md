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

- **Artist Profile Management**: Complete CRUD operations for artist data
- **Release Management**: Handling of artist releases (albums, singles)
- **Image Management**: Integration with Cloudinary for artist and release artwork

## Architecture

The service follows a modular architecture:

- **Artists Module**: Core business logic for artist entities
- **Releases Module**: Management of musical releases
- **Upload Module**: Handles file uploads to Cloudinary (production) or local storage (development)

## Getting Started

### Prerequisites

- Node.js (v18.x)
- npm or yarn
- PostgreSQL

### Environment Variables

```env
PORT=3000
NODE_ENV=development

# Database Configuration
# For local development:
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=melodia_artists

# For production (overrides individual DB params):
DATABASE_URL=postgres://user:pass@host:port/db

# Cloudinary (Required for Production)
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### Installation

```bash
$ npm install
```

### Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

### Test

```bash
# unit tests
$ npm run test

# test coverage
$ npm run test:cov
```

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

### Core Framework

- **NestJS**: Modern Node.js framework with TypeScript support
- **TypeORM**: ORM for PostgreSQL database interaction
- **Cloudinary**: Cloud-based image management
- **Multer**: Middleware for handling `multipart/form-data`

### Development & Testing

- **Jest**: Testing framework
- **ESLint**: Code quality and style enforcement
- **TypeScript**: Type safety and enhanced developer experience
