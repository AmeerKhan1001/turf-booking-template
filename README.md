# TurfBooker - Next.js Application

A modern turf booking system built with Next.js 15, featuring real-time availability checking, secure authentication, and comprehensive admin management.

## ✨ Features

### 🏟️ Core Functionality
- **Real-time Court Availability**: Check available time slots with conflict detection
- **Dynamic Pricing**: Weekday/weekend and day/night rate variations
- **Multi-Sport Support**: Book courts for different sports activities
- **Booking Management**: Create, view, and manage bookings with approval workflow

### 🔐 Authentication & Security
- **JWT Authentication**: Secure token-based authentication with HTTP-only cookies
- **Role-Based Access**: User and admin role management
- **Protected Routes**: Middleware-based route protection
- **Secure API**: All endpoints protected with proper authentication

### 👨‍💼 Admin Features
- **Booking Approval**: Approve or reject booking requests
- **Court Management**: Add and manage court availability
- **User Management**: View and manage user accounts
- **Dashboard Analytics**: Overview of bookings and revenue

### 💳 Payment Integration
- **UPI Integration**: Seamless UPI payment processing
- **Service Fee Management**: Configurable service fees
- **Price Calculation**: Automatic pricing based on time slots and duration

### 📱 Modern UI/UX
- **Responsive Design**: Mobile-first responsive interface
- **Shadcn UI Components**: Modern, accessible UI components
- **Real-time Updates**: Live availability and booking status updates
- **Error Handling**: Comprehensive error boundaries and user feedback

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Database**: PostgreSQL (Supabase)
- **ORM**: Drizzle ORM
- **Authentication**: JWT with HTTP-only cookies
- **UI Framework**: Tailwind CSS + Shadcn UI
- **State Management**: React Query (TanStack Query)
- **Form Handling**: React Hook Form with Zod validation
- **Icons**: Lucide React

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (for database)

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd turfbooker-nextjs
   npm install
   ```

2. **Environment Setup:**
   Create `.env.local` file with the following variables:
   ```env
   # Supabase Configuration
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # Pricing Configuration (in INR)
   NEXT_PUBLIC_SERVICE_FEE=0
   NEXT_PUBLIC_WEEKDAY_DAY_RATE=600
   NEXT_PUBLIC_WEEKDAY_NIGHT_RATE=1000
   NEXT_PUBLIC_WEEKEND_DAY_RATE=600
   NEXT_PUBLIC_WEEKEND_NIGHT_RATE=1100
   
   # Payment Configuration
   NEXT_PUBLIC_UPI_ID=your_upi_id@upi
   
   # Telegram Notifications (Optional)
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token
   TELEGRAM_CHAT_ID=your_telegram_chat_id
   ```

3. **Database Setup:**
   ```bash
   # Push database schema to Supabase
   npm run db:push
   ```

4. **Development Server:**
   ```bash
   npm run dev
   ```

5. **Open Application:**
   Visit [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── bookings/      # Booking management
│   │   ├── courts/        # Court management
│   │   └── user/          # User endpoints
│   ├── admin/             # Admin dashboard
│   ├── auth/              # Authentication pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── not-found.tsx      # 404 page
│   └── page.tsx           # Home page
├── components/
│   └── ui/                # Shadcn UI components
├── lib/                   # Utilities and configurations
│   ├── auth.ts           # Authentication utilities
│   ├── db.ts             # Database connection
│   ├── schema.ts         # Database schema
│   ├── storage.ts        # Data access layer
│   └── utils.ts          # Helper functions
└── middleware.ts          # Next.js middleware
```

## 🔧 Key Features

- **Server-Side Rendering**: Pages are rendered on the server for better SEO and performance
- **API Routes**: RESTful API endpoints built with Next.js API routes
- **Authentication**: JWT tokens with HTTP-only cookies for security
- **Database**: PostgreSQL with Drizzle ORM via Supabase
- **UI Components**: Radix UI primitives with Tailwind CSS
- **TypeScript**: Full type safety across the application

## 🚦 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login  
- `POST /api/auth/logout` - User logout
- `GET /api/user` - Get current user profile

### Courts Management
- `GET /api/courts` - Get all courts
- `GET /api/courts?date=YYYY-MM-DD&time=HH:MM&duration=X` - Get available courts
- `GET /api/courts/[id]` - Get specific court details

### Bookings Management
- `GET /api/bookings` - Get all bookings (admin) or user bookings
- `POST /api/bookings` - Create new booking
- `POST /api/bookings/conflicts` - Check booking time conflicts
- `DELETE /api/bookings/[id]` - Cancel/delete booking
- `PATCH /api/bookings/[id]/approve` - Approve booking (admin only)
- `PATCH /api/bookings/[id]/reject` - Reject booking (admin only)

## 🔐 Authentication & Authorization

### User Authentication
- **Registration**: New users can create accounts with username/password
- **Login/Logout**: Secure session management with JWT tokens
- **Session Persistence**: HTTP-only cookies for enhanced security
- **Password Security**: Bcrypt hashing for password storage

### Role-Based Access Control
- **User Role**: Can create and manage their own bookings
- **Admin Role**: Full access to all bookings, user management, and court administration
- **Route Protection**: Middleware automatically protects admin routes
- **API Security**: All endpoints validate user permissions

## 📊 Database Schema

### Core Tables
- **Users**: User accounts with role-based permissions
- **Courts**: Available courts with active/inactive status
- **Bookings**: Booking records with approval workflow

### Key Relationships
- Bookings are linked to specific courts
- User authentication separate from booking customer data
- Flexible schema supporting multiple sports and time slots

## 🎯 Usage Examples

### Creating a Booking
1. Select date and time slot
2. Choose sport and number of people
3. System calculates price based on time/day
4. Submit booking for admin approval
5. Receive confirmation via Telegram (if configured)

### Admin Management
1. Access admin dashboard at `/admin`
2. View all pending bookings
3. Approve or reject bookings
4. Manage court availability
5. Monitor booking analytics

## 🚀 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npm run db:push      # Push schema changes to database
```

## 🌐 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production
```env
SUPABASE_URL=your_production_supabase_url
SUPABASE_ANON_KEY=your_production_supabase_key
NEXT_PUBLIC_SERVICE_FEE=your_service_fee
NEXT_PUBLIC_WEEKDAY_DAY_RATE=your_weekday_day_rate
NEXT_PUBLIC_WEEKDAY_NIGHT_RATE=your_weekday_night_rate
NEXT_PUBLIC_WEEKEND_DAY_RATE=your_weekend_day_rate
NEXT_PUBLIC_WEEKEND_NIGHT_RATE=your_weekend_night_rate
NEXT_PUBLIC_UPI_ID=your_upi_id
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation in the `/docs` folder
- Review the API endpoints section for integration help

---

**Built with ❤️ using Next.js 15 and modern web technologies**
