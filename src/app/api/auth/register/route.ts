import { NextRequest, NextResponse } from 'next/server'
import { simpleDb } from '@/lib/simple-db'
import bcrypt from 'bcryptjs'
import { nanoid } from 'nanoid'

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await simpleDb.findUserByEmail(email)

    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const userId = nanoid()
    const user = await simpleDb.createUser({
      id: userId,
      name,
      email,
      password: hashedPassword,
      role: 'USER',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    // Return user without password
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(
      { message: 'User created successfully', user: userWithoutPassword },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}