import { NextRequest, NextResponse } from 'next/server';
import { signupSchema } from '@/lib/schema';
import { storage } from '@/lib/storage';
import { hashPassword, generateToken, setAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = signupSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({
        message: "Invalid registration data",
        errors: validationResult.error.format()
      }, { status: 400 });
    }

    const { username, password, fullName } = validationResult.data;

    // Check if user already exists
    const existingUser = await storage.getUserByUsername(username);
    if (existingUser) {
      return NextResponse.json({ message: "Username already exists" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const newUser = await storage.createUser({
      username,
      password: hashedPassword,
      fullName,
      role: 'user' // Default role for new registrations
    });

    // Generate JWT token
    const token = await generateToken(newUser);

    // Create response
    const response = NextResponse.json({
      id: newUser.id,
      username: newUser.username,
      fullName: newUser.fullName,
      role: newUser.role
    }, { status: 201 });

    // Set token in cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
      sameSite: 'strict'
    });

    return response;
  } catch (error) {
    console.error("Error registering user:", error);
    return NextResponse.json({ message: "Error registering user" }, { status: 500 });
  }
}