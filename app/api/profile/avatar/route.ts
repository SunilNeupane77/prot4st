import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import clientPromise from '@/lib/mongodb'
import { writeFile } from 'fs/promises'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.formData()
    const file: File | null = data.get('avatar') as unknown as File

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files allowed' }, { status: 400 })
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique filename
    const timestamp = Date.now()
    const filename = `avatar_${timestamp}_${file.name}`
    const path = join(process.cwd(), 'public/uploads/avatars', filename)

    await writeFile(path, buffer)

    const avatarUrl = `/uploads/avatars/${filename}`

    // Update user profile
    const client = await clientPromise
    const db = client.db('protest-org')

    await db.collection('users').updateOne(
      { email: session.user.email },
      { 
        $set: { 
          'profile.avatar': avatarUrl,
          updatedAt: new Date()
        }
      }
    )

    return NextResponse.json({ avatarUrl })
  } catch {
    return NextResponse.json({ error: 'Failed to upload avatar' }, { status: 500 })
  }
}
