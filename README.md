# Decentralized Todo Application with AI Integration

A blockchain-powered todo application that provides secure, transparent task management using Web3 technology and AI-driven task prioritization.

## Features

- Web3 authentication via MetaMask
- Blockchain-verified task completion
- AI-powered task prioritization and suggestions
- Real-time analytics dashboard
- Secure user authentication
- Responsive UI design

## Technology Stack

### Frontend
- React with TypeScript
- TanStack Query for state management
- Web3.js for blockchain interactions
- Tailwind CSS + shadcn/ui for styling
- Wouter for routing

### Backend
- Node.js with Express
- PostgreSQL with Drizzle ORM
- OpenAI GPT-4o for AI suggestions
- Passport.js for authentication

### Blockchain
- Ethereum (Sepolia Testnet)
- Solidity Smart Contracts

## Smart Contract Details

### Deployed Contract
- Network: Sepolia Testnet
- Address: `0x0b44aFb241958Daa4B6801Bb29A824E2E1aEF523`

### Contract Features
- Task verification on blockchain
- Task completion tracking
- Transaction history

## Setup Instructions

1. Clone the repository:
```bash
git clone [your-repo-url]
cd decentralized-todo
```

2. Install dependencies:
```bash
npm install
```
-> Create .env file
cp .env.example .env

3. Set up environment variables:
Create a `.env` file in the root directory with:
```env
DATABASE_URL=your_postgresql_url
OPENAI_API_KEY=your_openai_api_key
VITE_ALCHEMY_API_KEY=your_alchemy_api_key
VITE_TODO_CONTRACT_ADDRESS=0x0b44aFb241958Daa4B6801Bb29A824E2E1aEF523
```

4. Initialize the database:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

## API Documentation

### Authentication Endpoints

#### POST /api/register
Register a new user
```json
{
  "username": "string",
  "password": "string",
  "walletAddress": "string (optional)"
}
```

#### POST /api/login
Login with existing credentials
```json
{
  "username": "string",
  "password": "string"
}
```

### Task Endpoints

#### GET /api/tasks
Get all tasks for authenticated user

#### POST /api/tasks
Create a new task
```json
{
  "title": "string",
  "description": "string (optional)",
  "dueDate": "ISO date string (optional)"
}
```

#### PATCH /api/tasks/:id
Update task status
```json
{
  "completed": "boolean"
}
```

#### POST /api/tasks/prioritize
Get AI-powered task suggestions and prioritization

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

Final result should look like this
![fb8283fa-3548-4180-8a16-b57d87687fb4-00-2oqqr3h3lspp4 spock replit dev - Google Chrome 13-02-2025 18_53_47](https://github.com/user-attachments/assets/821cf6c9-113d-4b24-b3ce-f8972158ae85)


## Live Demo

[Replit Demo Link click here][(https://fb8283fa-3548-4180-8a16-b57d87687fb4-00-2oqqr3h3lspp4.spock.replit.dev/)]
