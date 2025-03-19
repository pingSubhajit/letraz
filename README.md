# Letraz Client

![Letraz Banner](https://i.imgur.com/pLMcA9a.png)

## Overview

Letraz is an AI-powered platform that helps job seekers create tailored resumes for every job application effortlessly. The tool optimizes resumes for ATS (Applicant Tracking Systems) and recruiters, ensuring your skills and experience match each job's specific requirements.

This repository contains the client-side implementation of the Letraz application, built with Next.js, TypeScript, and Tailwind CSS.

## Core Features

- **Tailored Resumes**: Automatically customize your resume for each job position
- **ATS-Friendly Design**: Ensure your resume passes through Applicant Tracking Systems
- **Effortless Creation**: Simplify the resume creation process using AI assistance
- **Job Description Analysis**: Extract key requirements from job descriptions to optimize your resume

## Tech Stack

- [Next.js 15](https://nextjs.org/) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Django backend](https://www.djangoproject.com/) - The web framework for Python
- [Clerk](https://clerk.com/) - Authentication provider
- [Tanstack Query](https://tanstack.com/query/latest) - Data fetching and state management
- [React Email](https://react.email/) - Email template system
- [Resend](https://resend.com/) - Email delivery service
- [Sentry](https://sentry.io/) - Error tracking

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18 or later)
- [Bun](https://bun.sh/) (v1.1.42 or later)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/pingSubhajit/letraz.git
   cd letraz-client
   ```

2. Install dependencies
   ```bash
   bun install
   ```

3. Set up environment variables
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file with your configuration values.

4. Run the development server
   ```bash
   bun run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) to view the application.

## Development Workflow

- **Development**: `bun run dev` (runs with Turbo mode enabled)
- **Email Development**: `bun run email` (previews email templates)
- **Build**: `bun run build`
- **Start Production Server**: `bun run start`
- **Linting**: `bun run lint` or `bun run lint:fix`

## Project Structure

- `app/` - Next.js app directory containing all routes and pages
- `components/` - Reusable UI components
- `emails/` - Email templates
- `lib/` - Utility functions and shared code
- `public/` - Static assets
- `hooks/` - Custom React hooks

## Philosophy

As described in our [story page](https://letraz.app/story), Letraz bridges the gap between potential and opportunity by:

1. **Empowering Users**: Amplifying individual potential through better presentation of skills and achievements
2. **Simplifying Complexity**: Making the resume creation process straightforward while maintaining depth and meaning
3. **Purposeful Innovation**: Using technology as an enabler to solve real problems for job seekers

## Contributing

We are not currently accepting public contributions to this repository. However, if you're interested in joining our core development team, please reach out to us on [Discord](https://discord.gg/letraz).

## License

This project is licensed under the terms specified in the [LICENSE](LICENSE) file.

## Links

- [Website](https://letraz.app)
- [API Documentation](https://outline.letraz.app/introduction)
- [GitHub Repository](https://github.com/pingSubhajit/letraz)
