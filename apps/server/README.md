# Letraz Server

![Letraz Banner](https://i.imgur.com/pLMcA9a.png)

## Overview

Letraz Server is the backend API service that powers Letraz, an AI-powered platform that helps job seekers create tailored resumes for every job application effortlessly. The server provides robust APIs for user management, job posting analysis, resume creation and optimization, ensuring seamless integration with the frontend client.

This repository contains the server-side implementation of the Letraz application, now built with Encore.ts (TypeScript), Node.js, and PostgreSQL (via Drizzle ORM), featuring comprehensive user authentication, resume management, search, analytics, and job analysis capabilities.

## Core Features

* **User Profile Management**: Complete user profile system with personal information, contact details, and preferences
* **Resume Builder**: Advanced resume creation and management with sections for education, experience, skills, projects, and certifications
* **Job Analysis**: Job posting parsing and requirement extraction for tailored resume optimization
* **Waitlist Management**: Early access signup system with automated positioning
* **Skills Database**: Comprehensive skills catalog with categorization and proficiency levels
* **API Documentation**: Auto-generated OpenAPI documentation with interactive testing interface
* **Authentication**: Secure user authentication via Clerk integration
* **Data Validation**: Robust input validation and error handling

## Tech Stack

* **Encore.ts** - Type-safe TypeScript backend framework
* **Node.js 22+ / TypeScript 5** - Runtime and language
* **Drizzle ORM + PostgreSQL** - SQL schema and access (migrations applied by Encore)
* **Clerk** - Authentication and user management
* **Sentry** - Application monitoring and error tracking
* **PostHog** - Product analytics
* **Algolia** - Full-text search indexing
* **Knock** - Notifications
* **Puppeteer/Chromium** - Headless browser for rendering/evaluation
* **Docker** - Containerized deployment support

## Getting Started

### Prerequisites

* Node.js 20 or later
* Encore CLI (install from `https://encore.dev/docs/install`)
* Docker (optional, for containerized deployment)

### Installation

1. **Install Encore CLI**
   See Encore's installation guide (`https://encore.dev/docs/install`).

2. **Clone the repository**
   ```bash
   git clone https://github.com/LetrazApp/letraz-server.git
   cd letraz-server
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Set up secrets (required for auth, search, analytics, etc.)**
   Use Encore Secrets to configure credentials per environment. Example (local):
   ```bash
   encore secret set --type local ClerkFrontEndApiUrl
   encore secret set --type local ClerkSecretKey
   encore secret set --type local SentryDSN
   encore secret set --type local PosthogApiKey
   encore secret set --type local PosthogHost
   encore secret set --type local AlgoliaAppId
   encore secret set --type local AlgoliaApiKey
   encore secret set --type local KnockApiKey
   ```

5. **Run the development server**
   ```bash
   encore run --watch
   ```

6. **Access the application**
    - API Base: `http://localhost:4000`
    - Generate OpenAPI / clients: `encore gen client --lang=openapi` or `--lang=typescript`

## Development Workflow

* **Development Server**: `encore run --watch`
* **Logs**: `encore logs`
* **Database**: Migrations are applied automatically at runtime by Encore. Use `encore db` commands as needed (e.g., `encore db shell <db-name>`)
* **Lint**: `npm run lint` / `npm run lint:fix`
* **Client/OpenAPI**: `encore gen client --lang=openapi` or `--lang=typescript`
* **Docker Build**: `encore build docker` (or use your CI/CD)

## Project Structure

* `encore.app` - Encore application configuration
* `services/` - Service modules and endpoints
  * `core/`, `identity/`, `resume/`, `job/`, `search/`, `analytics/`, `notifications/`, `webhooks/`, `utils/`
  * `encore.service.ts` - Service definition and middleware
  * `*.ts` - Endpoints, controllers, actions, topics, and schemas
  * `migrations/` - SQL migrations for each service (applied automatically)
* `package.json` - Node.js project configuration
* `tsconfig.json` - TypeScript configuration

## API Endpoints

The API is organized into the following main sections:

* **Core** - Core utilities and shared functionality
* **Identity** - Authentication/user management via Clerk
* **Job** - Job posting and analysis management
* **Resume** - Resume creation, sections, and optimization
* **Search** - Algolia indexing and search
* **Analytics** - PostHog event capture
* **Notifications** - Knock workflows
* **Webhooks** - External integrations

### Authentication

All API endpoints (except public endpoints like waitlist signup) require authentication via Clerk. Include the authorization header in your requests:

```
Authorization: Bearer <your-clerk-token>
```

Admin endpoints use an API key header:

```
x-admin-api-key: <admin-key>
```

### API Documentation / Clients

Generate an OpenAPI spec or client with:

```
encore gen client --lang=openapi
```

## Environment Configuration

The application runs across multiple environments managed by Encore:

* **Local**: Local development environment
* **Development/Preview/Production**: Cloud environments

Key secrets (set via `encore secret set`):
- `ClerkFrontEndApiUrl`
- `ClerkSecretKey`
- `SentryDSN`
- `PosthogApiKey`
- `PosthogHost`
- `AlgoliaAppId`
- `AlgoliaApiKey`
- `KnockApiKey`

## Contributing

We are not currently accepting public contributions to this repository. However, if you're interested in joining our core development team, please reach out to us through our official channels.

## License

This project is licensed under the terms specified in the LICENSE file.

## Links

* [Frontend Repository](https://github.com/pingSubhajit/letraz) - Next.js client application  
* [Production API](https://api.letraz.app/api/v1/) - Live API endpoint
* [Website](https://letraz.app) - Official Letraz website
* Generate API clients locally with `encore gen client --lang=openapi`

