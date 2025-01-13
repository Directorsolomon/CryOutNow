# CryOutNow

A web application for sharing and managing prayer requests, built with React, TypeScript, and Firebase.

## Features

- User authentication (Email/Password and Google Sign-In)
- User profile management
- Prayer request creation and management
- Real-time updates
- Responsive design

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **UI Components**: Shadcn/ui
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **State Management**: React Context, TanStack Query
- **Routing**: React Router
- **Styling**: Tailwind CSS
- **Form Handling**: React Hook Form, Zod

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Directorsolomon/CryOutNow.git
cd CryOutNow
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with your Firebase configuration:
```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

4. Start the development server:
```bash
npm run dev
```

## Project Structure

```
src/
├── components/        # Reusable UI components
│   ├── auth/         # Authentication-related components
│   ├── layout/       # Layout components
│   └── ui/           # UI components from shadcn/ui
├── contexts/         # React contexts
├── lib/             # Library configurations
├── pages/           # Page components
├── services/        # API and service functions
└── types/           # TypeScript type definitions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
