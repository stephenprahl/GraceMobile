# Grace Mobile

A mobile application for spiritual growth with features like chat, Bible verses, prayers, and devotionals.

## Features

- Real-time chat interface
- Bible verse lookup
- Prayer requests and tracking
- Daily devotionals
- User authentication (coming soon)

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Prisma CLI (`npm install -g prisma`)
- PostgreSQL database

## Setup

### Server Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your environment variables. Copy `.env.example` to `.env` and update the values:
   ```bash
   cp .env.example .env
   ```

4. Run database migrations:
   ```bash
   npx prisma migrate dev --name init
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

### Client Setup

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Expo development server:
   ```bash
   npm start
   ```

4. Use the Expo Go app on your mobile device or an emulator to run the application.

## Project Structure

- `/server` - Backend API server
  - `/prisma` - Database schema and migrations
  - `/src` - Server source code
    - `/routes` - API routes
    - `/services` - Business logic
    - `/middleware` - Express middleware

- `/client` - Mobile application
  - `/src` - Client source code
    - `/api` - API client and configuration
    - `/components` - Reusable UI components
    - `/contexts` - React contexts
    - `/screens` - Screen components
    - `/services` - Business logic services
    - `/types` - TypeScript type definitions

## Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
