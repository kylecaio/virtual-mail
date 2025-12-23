import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
          const body = await request.json();
          const { email, password, firstName, lastName, company, phone } = body;

      // Validate required fields
      if (!email || !password || !firstName || !lastName) {
              return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
                      );
      }

      // Check if user already exists
      const existingUser = await db.user.findUnique({
              where: { email: email.toLowerCase() },
      });

      if (existingUser) {
              return NextResponse.json(
                { error: 'User with this email already exists' },
                { status: 409 }
                      );
      }

      // Hash password
      const hashedPassword = await hash(password, 12);

      // Create user with CUSTOMER role
      const user = await db.user.create({
              data: {
                        email: email.toLowerCase(),
                        password: hashedPassword,
                        firstName,
                        lastName,
                        company: company || null,
                        phone: phone || null,
                        role: 'CUSTOMER',
              },
      });

      return NextResponse.json(
        {
                  message: 'User created successfully',
                  user: {
                              id: user.id,
                              email: user.email,
                              firstName: user.firstName,
                              lastName: user.lastName,
                  },
        },
        { status: 201 }
            );
    } catch (error) {
          console.error('Registration error:', error);
          return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
                );
    }
}
