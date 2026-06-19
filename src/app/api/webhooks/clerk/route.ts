import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import connectToDatabase from '@/lib/db/mongoose'
import { User } from '@/lib/db/models/User'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
  }

  // Get the headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occured', {
      status: 400,
    })
  }

  // Handle the event
  const eventType = evt.type

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data

    const email = email_addresses[0]?.email_address
    const name = `${first_name || ''} ${last_name || ''}`.trim() || 'Student'

    try {
      await connectToDatabase()
      
      // Create user in MongoDB
      await User.create({
        clerkId: id,
        email,
        name,
        image: image_url,
        emailVerified: true, // Clerk verified it before creating
        role: "student", // Default role
        reputation: 0,
      })
      
      console.log(`User ${id} successfully synced to MongoDB`)
    } catch (error) {
      console.error('Error syncing user to MongoDB:', error)
      return new Response('Error syncing to database', { status: 500 })
    }
  }

  if (eventType === 'user.updated') {
    const { id, first_name, last_name, image_url } = evt.data
    const name = `${first_name || ''} ${last_name || ''}`.trim() || 'Student'

    try {
      await connectToDatabase()
      await User.findOneAndUpdate(
        { clerkId: id },
        { name, image: image_url },
        { new: true }
      )
    } catch (error) {
      console.error('Error updating user in MongoDB:', error)
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data
    try {
      await connectToDatabase()
      await User.findOneAndDelete({ clerkId: id })
    } catch (error) {
      console.error('Error deleting user from MongoDB:', error)
    }
  }

  return NextResponse.json({ success: true })
}
