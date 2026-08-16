# Nova Store

A modern software marketplace for discovering and downloading applications.

## Features

- Browse and search applications
- Developer dashboard for publishing apps
- Instant publishing (no moderation)
- Google Drive download links
- Version history and rollback
- Reviews and ratings
- Favorites
- Multilingual (English, Russian, Uzbek)
- Dark/Light theme
- Monochrome design

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- Prisma ORM
- SQLite (development)
- bcrypt for password hashing

## Getting Started

### Prerequisites

- Node.js 22+
- npm

### Installation

```bash
npm install
```

### Environment Setup

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

### Database

```bash
npm run seed
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Google Drive Workflow

1. Upload installer to Google Drive
2. Set sharing to "Anyone with the link"
3. Copy sharing URL
4. Paste into Nova Store Developer Dashboard
5. Publish instantly

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run seed` - Seed database with demo data

## Project Structure

```
src/
  app/                    # Next.js App Router pages
    api/                  # API routes
    app/[slug]/           # Application details
    developer/            # Developer dashboard
    developers/           # Developer profiles
    categories/           # Categories
    explore/              # Browse apps
    favorites/            # User favorites
    login/                # Login
    register/             # Register
  components/             # Reusable components
  lib/                    # Utilities, i18n, validators
prisma/
  schema.prisma           # Database schema
  seed.ts                 # Seed script
```

## API Endpoints

### Applications
- `GET /api/apps` - List applications
- `GET /api/apps/:slug` - Get application details
- `POST /api/apps` - Create application (developer)
- `PATCH /api/apps/:id` - Update application (developer)

### Versions
- `GET /api/apps/:slug/versions` - List versions
- `GET /api/apps/:slug/versions/latest` - Get latest version
- `POST /api/apps/:id/versions` - Create version (developer)
- `PATCH /api/apps/:slug/versions/:versionId` - Update version
- `POST /api/apps/:slug/versions/:versionId` - Publish/Archive/Rollback

### Downloads
- `POST /api/apps/:slug/download` - Record download and get URL

### Auth
- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Current user

### Others
- `GET /api/categories` - List categories
- `GET /api/search` - Search applications
- `POST /api/apps/:slug/reviews` - Create review
- `POST /api/apps/:slug/favorite` - Toggle favorite
- `GET /api/favorites` - User favorites
- `GET /api/developers` - List developers
- `GET /api/developers/:id` - Developer profile

## License

MIT
