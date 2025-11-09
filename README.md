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

## TODO Progress

### Artist Profile Features

#### Artist Identity

- [x] **CA1**: Artist identity visual elements
  - **Name**: Artist name display (`name` field)
  - **Images**: Profile image and cover support (`imageUrl`, `coverUrl` fields)
  - **Fallback**: Proper handling for missing images
  - **Endpoints**: `GET /artists/:id`, `PATCH /artists/:id/media`

#### Artist Metrics

- [x] **CA2**: Monthly listeners metric (handled by metrics service)
- [x] **CA2**: Followers count tracking (`followersCount` field)
  - **Endpoints**: `PATCH /artists/:id/follow`, `PATCH /artists/:id/unfollow`

#### Artist Actions

- [x] **CA3**: Follow/Unfollow functionality
  - **Follow**: `PATCH /artists/:id/follow` - Increment followers count
  - **Unfollow**: `PATCH /artists/:id/unfollow` - Decrement followers count
- [ ] **CA3**: Play and Shuffle controls (responsibility of player/songs service)
  - Play should start from #1 Popular song
  - Shuffle should mix top 10 popular songs

#### Artist Profile Structure

- [x] **CA4**: Discography module
  - **Endpoint**: `GET /artists/:id/releases` with type filtering
  - **Types**: Albums, Singles, EPs support
- [x] **CA4**: About section
  - **Bio**: Artist biography field in entity (`bio` field)
  - **Social Links**: Social media links support (`socialLinks` field)
- [ ] **CA4**: Popular songs module (requires songs service integration)
- [ ] **CA4**: Liked Songs module (handled by users service + songs service)
- [ ] **CA4**: Artist Pick module (requires manual curation feature)
- [ ] **CA4**: Appears On module (requires collaboration/feature detection)
- [ ] **CA4**: Similar Artists module (requires recommendation algorithm)

#### Liked Songs Integration

- [ ] **CA5**: User liked songs filtering by artist (handled by users service)
  - Should show "Liked songs (N)" when user has ≥1 liked song from artist
  - Should open filtered collection ordered by most recent

### Discography Management

#### Discography Organization (CA1 & CA2)

- [x] **CA1**: Tab-based discography structure
  - **Albums Tab**: `GET /artists/:id/albums` - Albums only
  - **Singles & EPs Tab**: `GET /artists/:id/singles-eps` - Singles and EPs combined
  - **Organized View**: `GET /artists/:id/discography` - Both sections in one response
  - **Filtering**: Only primary artist releases (no playlists or collaborations)

- [x] **CA2**: Proper ordering by tab
  - **Albums**: Ordered by release date descending, alphabetical tie-breaker
  - **Singles & EPs**: Ordered by release date descending, alphabetical tie-breaker
  - **Latest Release Badge**: `isLatest` flag for most recent releases
  - **Popular Releases**: Ready for metrics service integration (endpoint: `GET /metrics/albums`)

#### Discography Features

- [x] **CA3**: Release card display (frontend responsibility)
  - Cover image, title, year, type chip (Album/EP/Single)
  - Navigation to release details
  - Single treated as collection of 1 song

- [x] **CA4**: Upcoming releases implementation
  - **Endpoint**: `GET /artists/:id/releases/upcoming` - Get scheduled releases
  - **Published only**: `GET /artists/:id/releases/published` - Get published releases only
  - Scheduled releases with future dates
  - Release status management (DRAFT, SCHEDULED, PUBLISHED)

### Release Publication Management

#### Release Creation and Validation (CA1)

- [x] **CA1**: Guided creation with validations
  - **Required fields**: Title, genres, cover image, audio files (songIds)
  - **Validation**: Prevents continuation without required fields
  - **Error reporting**: Clear validation messages for missing requirements

#### Publication Options (CA2)

- [x] **CA2**: Unified release creation with smart publication logic
  - **Endpoint**: `POST /artists/:id/releases` - Single endpoint for all publication types
  - **Publish immediately**: When no `scheduledPublishAt` is provided, publishes instantly
  - **Schedule publication**: When `scheduledPublishAt` is provided and is future date, schedules automatically
  - **Smart status**: Automatically determines PUBLISHED vs SCHEDULED based on timing

#### Post-Publication Editing (CA4)

- [x] **CA4**: Edit metadata for any release state (Draft, Scheduled, or Published)
  - **Main endpoint**: `PATCH /artists/:artistId/releases/:releaseId` - Edit any metadata
  - **Editable fields**: Title, type, release date, cover, genres, songs, scheduling
  - **Cover-specific**: `PATCH /:artistId/releases/:releaseId/cover` - Update cover image only
  - **Song management**:
    - `PATCH /:artistId/releases/:releaseId/songs/add` - Add songs to release
    - `PATCH /:artistId/releases/:releaseId/songs/remove` - Remove songs from release
  - **State-agnostic**: Works for DRAFT, SCHEDULED, and PUBLISHED releases
  - **No restrictions**: All non-critical metadata can be modified post-publication

#### Song Location Management (CA5)

- [x] **CA5**: Define song destination and manage release content
  - **Single creation**: `POST /artists/:id/releases` with `type: 'SINGLE'` and `songIds: ['song-id']`
  - **EP/Album management**: Add songs to existing non-published releases
    - `PATCH /:artistId/releases/:releaseId/songs/add` - Add songs to DRAFT or SCHEDULED releases
    - `PATCH /:artistId/releases/:releaseId/songs/remove` - Remove songs from DRAFT or SCHEDULED releases
  - **Publication protection**: Cannot modify song list of PUBLISHED releases
  - **Song ordering**: Array order in `songIds` defines track sequence
  - **Create new**: `POST /artists/:id/releases` to create new EP/Album with songs
  - **Playlist exclusion**: No playlist functionality - only official releases (Singles, EPs, Albums)

#### Release Availability Management

- [x] **Simplified availability approach**:
  - **Frontend-driven**: Frontend checks `scheduledPublishAt` to show "upcoming" vs "available"
  - **Songs service responsibility**: Individual song availability handled by Songs microservice
  - **400 responses**: Songs API returns 400 when song not yet available with `availableAt` timestamp
  - **No complex scheduling**: Avoids cron jobs and background workers
  - **Real-time UI**: Frontend can show countdown timers and "coming soon" states

#### Release Metadata Management

- [x] **Enhanced release entity** with publication fields
  - **Status tracking**: DRAFT, SCHEDULED, PUBLISHED states
  - **Scheduling**: scheduledPublishAt field for timed publication
  - **Metadata**: genres support for music categorization
