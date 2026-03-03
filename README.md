# File Management System Backend

A robust backend solution for managing files and folders, built with Node.js, Express, and Prisma. This project supports recursive folder structures, file uploads, role-based access control, and real-time updates via Socket.io.

## Features

- **Authentication & Authorization:** Secure JWT-based authentication with Bcrypt password hashing. Role-based access control for Super Admin, Admin, and User roles.
- **File & Folder Management:** Support for recursive folder nesting, file storage, and organization with Prisma and PostgreSQL.
- **File Uploads:** Integrated Multer middleware for categorized file uploads (images, profiles, media, docs) with validation.
- **Database ORM:** Uses Prisma with PostgreSQL (compatible with Neon and Supabase) for efficient data modeling and querying.
- **Real-time Communication:** Built-in support for Socket.io to handle real-time notifications or updates.
- **Email Service:** Integration with Nodemailer for sending automated emails (OTP, account verification, etc.).
- **Validation:** Strong data validation using Zod schemas for all API requests.
- **Logging:** Comprehensive logging with Winston and API request tracking with Morgan.
- **Auto-seeding:** Automatic Super Admin account creation on first database connection.

## Tech Stack

- **Runtime:** [Node.js](https://nodejs.org/)
- **Framework:** [Express.js](https://expressjs.com/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **ORM:** [Prisma](https://www.prisma.io/)
- **Database:** PostgreSQL (Neon DB recommended)
- **Validation:** [Zod](https://zod.dev/)
- **Security:** JWT, Bcrypt
- **File Handling:** Multer
- **Real-time:** Socket.io
- **Mailing:** Nodemailer
- **Logging:** Winston, Morgan

## Getting Started

Follow these steps to set up the project locally.

### Prerequisites

- Node.js (v18+)
- npm or yarn
- A PostgreSQL database instance (e.g., [Neon](https://neon.tech/))

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/file-management-backend.git
   cd file-management-backend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up Environment Variables:**

   Create a `.env` file in the root directory and add the following:

   ```env
   # App Configuration
   NODE_ENV=development
   PORT=5000
   IP_ADDRESS=0.0.0.0

   # Database (Prisma)
   DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"

   # Bcrypt
   BCRYPT_SALT_ROUNDS=12

   # JWT
   JWT_SECRET=your_super_secret_key
   JWT_EXPIRE_IN=7d

   # Email Service (SMTP)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   EMAIL_FROM="App Name <your-email@gmail.com>"

   # Super Admin Credentials
   SUPER_ADMIN_EMAIL=admin@myapp.com
   SUPER_ADMIN_PASSWORD=Admin@123
   ```

4. **Prisma Setup:**

   Generate the Prisma Client and sync the database schema:

   ```bash
   npx prisma generate
   npx prisma db push
   ```

### Running the Application

- **Development Mode:**

  ```bash
  npm run dev
  ```

- **Prisma Studio:**
  (To view and manage database data through a GUI)

  ```bash
  npm run studio
  ```

- **Linting & Formatting:**

  ```bash
  npm run lint:check
  npm run lint:fix
  npm run prettier:fix
  ```

## API Documentation

- (Add your API documentation link or details here)

## License

ISC
