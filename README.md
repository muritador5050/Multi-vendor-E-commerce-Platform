# Multivendor E-Commerce Platform

A comprehensive full-stack e-commerce solution that enables multiple vendors to sell their
products through a single platform, with separate interfaces for admins, vendors, and customers.

## Features

### Customer Features
- Browse products from multiple vendors
- Advanced search and filtering
- Shopping cart and wishlist
- Secure payment processing (Stripe & Paystack)
- Order tracking and history
- User authentication with social login (Google, Facebook)
- Product reviews and ratings

### Vendor Features
- Vendor dashboard and analytics
- Product management (CRUD operations)
- Inventory tracking
- Order management
- Sales reporting and charts
- Bulk operations with Excel export/import

### Admin Features
- Complete platform oversight
- User and vendor management
- Order management system
- Payment management system
- Blog management sysytem
- Analytics and reporting
- Content management
- Platform configuration

## Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Library**: Chakra UI with Emotion
- **State Management**: TanStack React Query
- **Routing**: React Router DOM
- **Animations**: Framer Motion
- **Icons**: Lucide React, React Icons
- **Charts**: Recharts
- **Forms**: React Select, Downshift
- **Rich Text Editor**: TinyMCE
- **PDF Generation**: jsPDF with html2canvas
- **Excel Operations**: SheetJS (xlsx)
- **HTTP Client**: Axios
- **Authentication**: JWT with js-cookie

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT, Passport.js (Google, Facebook OAuth)
- **Payment Processing**: Stripe, Paystack
- **Security**: Helmet, bcrypt, CORS, Rate limiting
- **File Upload**: Multer
- **Email Service**: Resend
- **API Documentation**: Swagger UI
- **Caching**: API Cache
- **Validation**: Joi
- **Scheduled Tasks**: Node-cron
- **Logging**: Morgan

### Development & DevOps
- **Development Server**: Nodemon
- **Testing**: Jest, Supertest
- **Code Coverage**: NYC
- **API Testing**: Postman, Insomnia
- **Environment Management**: dotenv, cross-env
- **Process Management**: Concurrently
- **Tunneling**: ngrok for webhook testing
- **Code Quality**: ESLint, TypeScript ESLint

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- Git

### Backend Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/multi-vendor-ecommerce-platform.git
cd multi-vendor-ecommerce-platform

# Install backend dependencies
cd server
npm install

# Create environment file
cp .env
# Configure your environment variables

# Start development server
npm run dev
```

### Frontend Setup
```bash
# Install frontend dependencies
cd client
npm install

# Start development server
npm run dev
```

### Environment Variables
Create a `.env` file in the server directory:

```env
NODE_ENV=development
PORT=8000
MONGODB_URI=mongodb://localhost:27017/multivendor-ecommerce
JWT_SECRET=jwt_secret
JWT_EXPIRES_IN=7d

# Payment Gateways
STRIPE_SECRET_KEY=stripe_secret_key
STRIPE_PUBLISHABLE_KEY=stripe_publishable_key
PAYSTACK_SECRET_KEY=paystack_secret_key

# OAuth
GOOGLE_CLIENT_ID=google_client_id
GOOGLE_CLIENT_SECRET=google_client_secret
FACEBOOK_APP_ID=facebook_app_id
FACEBOOK_APP_SECRET=facebook_app_secret

# Email Configuration
EMAIL_HOST=email_host
EMAIL_USER=email
RESEND_KEY=resend



```

## Running the Application

### Development Mode
```bash
# Start backend server
cd server
npm run dev

# Start frontend server (in another terminal)
cd client
npm run dev
```

### Production Mode
```bash
# Build frontend
cd client
npm run build

# Start production server
cd server
npm start
```


## API Documentation

The API documentation is available at `/api-docs` when running the server. This interactive documentation is built with Swagger UI and provides detailed information about all endpoints.

## Project Structure

```
multi-vendor-ecommerce-platform/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── hooks/         # Custom React hooks
│   │   ├── utils/         # Utility functions
│   │   └── types/         # TypeScript type definitions
│   └── public/            # Static assets
│
├── server/                 # Node.js backend
│   ├── controllers/       # Route controllers
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── utils/            # Utility functions
│   └── config/           # Configuration files
│
└── README.md
```

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting to prevent abuse
- CORS configuration
- Input validation with Joi
- Secure HTTP headers with Helmet
- Environment variable protection

## Payment Integration

The platform supports multiple payment gateways:
- **Stripe**: International payments with comprehensive features
- **Paystack**: African market focus with local payment methods
-**Stripe-card-for-testing**: 4242 4242 4242 4242,  10/30, 564

## Key Technical Highlights

- **Type Safety**: Full TypeScript implementation on the frontend
- **Performance**: React Query for efficient data fetching and caching
- **User Experience**: Smooth animations with Framer Motion
- **Responsive Design**: Mobile-first approach with Chakra UI
- **Developer Experience**: Hot reload, comprehensive testing, and API documentation
- **Scalability**: Modular architecture with separation of concerns
- **Security**: Industry-standard security practices and authentication

## Author

**Abdulazeez Muritador**
- Email: muritador5050@gmail.com


## Support

If you have any questions or need support, please feel free to reach out via email or create an issue in the repository.
