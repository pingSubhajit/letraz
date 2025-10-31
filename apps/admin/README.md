# Letraz Admin

A Next.js-based administrative panel for the Letraz ecosystem, providing tools for PR generation, user management, and Linear integration.

## Overview

Letraz Admin is a web application that streamlines development workflows by automating pull request description generation from Linear issues and providing administrative utilities for user management within the Letraz platform.

## Key Features

- **PR Generation**: Automatically generate comprehensive pull request descriptions from Linear issues using OpenAI
- **User Management**: Administrative API for checking user signup status and verification
- **Linear Integration**: Seamless OAuth integration with Linear for issue management
- **Authentication**: Secure user authentication powered by Clerk
- **Dark Mode**: Built-in dark/light theme support
- **Responsive Design**: Modern, mobile-friendly interface

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- Linear account with API access
- Clerk account for authentication
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/pingSubhajit/letraz-admin.git
cd letraz-admin
```

2. Install dependencies:
```bash
bun install
# or
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Configure the following environment variables:
```
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_APP_URL=current_url_of_the_app
OPENAI_API_KEY=your_openai_api_key
CONSUMER_API_KEY=your_admin_api_key
LINEAR_CLIENT_ID=your_linear_client_id
LINEAR_CLIENT_SECRET=your_linear_client_secret
NEXT_PUBLIC_LINEAR_CLIENT_ID=your_linear_client_id
```

4. Run the development server:
```bash
bun dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Technologies Used

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Authentication**: Clerk
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **API Integration**: Linear SDK
- **AI**: OpenAI API
- **Icons**: Lucide React

## License

This project is proprietary software owned by Letraz.

## Contact

For questions or support, contact the Letraz development team.
