# Safe Protest Platform

A secure communication and coordination platform for civil rights organizations and peaceful protesters.

## Features

- **Encrypted Messaging**: End-to-end encrypted group chats for secure coordination
- **Event Planning**: Organize protests, meetings, and community events
- **Resource Mapping**: Find hospitals, legal aid, emergency contacts, and safe houses
- **Fact Checking**: Community-driven rumor verification system
- **Emergency Alerts**: Real-time safety notifications
- **Privacy First**: Built with security and privacy as core principles

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **UI Components**: Radix UI, shadcn/ui, Lucide React
- **Backend**: Next.js API Routes
- **Database**: MongoDB
- **Security**: AES encryption, password hashing
- **Authentication**: NextAuth.js (ready for implementation)

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB (local or cloud)
- npm/yarn/pnpm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd protest-org
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your configuration:
```env
MONGODB_URI=mongodb://localhost:27017/protest-org
ENCRYPTION_KEY=your-secret-encryption-key-change-in-production
NEXTAUTH_SECRET=your-nextauth-secret-key
NEXTAUTH_URL=http://localhost:3000
```

4. Start MongoDB (if running locally):
```bash
mongod
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Endpoints

- `POST /api/auth/register` - User registration
- `GET/POST /api/messages` - Encrypted messaging
- `GET/POST /api/events` - Event management
- `GET/POST /api/resources` - Resource mapping

## Security Features

- AES encryption for messages
- Password hashing with salt
- Environment-based configuration
- Input validation and sanitization
- HTTPS enforcement (production)

## Contributing

This platform is built to support civil rights and peaceful protest coordination. Contributions should align with these values.

## License

MIT License - Built for the people, by the people.

## Disclaimer

This platform is designed for legal, peaceful protest coordination and civil rights activities. Users are responsible for complying with local laws and regulations.
# prot4st
