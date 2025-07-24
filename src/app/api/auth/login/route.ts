import { NextRequest, NextResponse } from 'next/server';
import { signinSchema } from '@/lib/schema';
import { storage } from '@/lib/storage';
import { comparePasswords, generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = signinSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({
        message: "Invalid login data",
        errors: validationResult.error.format()
      }, { status: 400 });
    }

    const { username, password } = validationResult.data;

    // Find user
    const user = await storage.getUserByUsername(username);
    if (!user) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    // Verify password
    const isPasswordValid = await comparePasswords(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    // Generate JWT token
    const token = await generateToken(user);

    // Create response
    const response = NextResponse.json({
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role
    });

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
    console.error("Error logging in:", error);
    return NextResponse.json({ message: "Error logging in" }, { status: 500 });
  }
}