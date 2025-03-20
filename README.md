# NestJS Authentication Service

A robust authentication service built with NestJS, featuring user management, JWT authentication, and email functionality.

## Features

- 🔐 JWT-based authentication
- 👤 User management
- 📧 Email service integration
- 🛡️ Rate limiting
- 📝 Swagger API documentation
- 🧪 Comprehensive testing setup
- 🔍 Input validation
- 🖋️ E2E testing

## Prerequisites

- Node.js (v16 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd auth
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration values.

## Running the Application

### Development Mode
```bash
npm run start:dev
```

### Production Mode
```bash
npm run build
npm run start:prod
```

### Debug Mode
```bash
npm run start:debug
```

## API Documentation

Once the application is running, you can access the Swagger API documentation at:
```
http://localhost:5000/api-docs
```

## Testing

### Unit Tests
```bash
npm run test
```

### e2e Tests
```bash
npm run test:e2e
```

### Test Coverage
```bash
npm run test:cov
```
