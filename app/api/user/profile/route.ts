import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

// GET /api/user/profile — fetch the logged-in user's profile
export async function GET() {
  // auth() checks the session cookie and returns the session
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Not logged in" },
      { status: 401 } // 401 = Unauthorized
    )
  }

  // Get user + their profile from database
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { profile: true }, // include the related Profile row
  })

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  // Send back the data (without password)
  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    profile: user.profile,
  })
}

// PUT /api/user/profile — update the logged-in user's profile
export async function PUT(request: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 })
  }

  const body = await request.json()

  // Update the user's name if provided
  if (body.name) {
    await db.user.update({
      where: { id: session.user.id },
      data: { name: body.name.trim() },
    })
  }

  // Update or create the profile
  const updatedProfile = await db.profile.upsert({
    where: { userId: session.user.id },
    // "upsert" = update if exists, create if not
    update: {
      phone: body.phone,
      location: body.location,
      dateOfBirth: body.dateOfBirth,
      gender: body.gender,
      bloodGroup: body.bloodGroup,
      emergencyContact: body.emergencyContact,
      emailAlerts: body.emailAlerts,
      pushNotifications: body.pushNotifications,
      medicationReminders: body.medicationReminders,
      healthTips: body.healthTips,
      weeklyReport: body.weeklyReport,
    },
    create: {
      userId: session.user.id,
      phone: body.phone,
      location: body.location,
      dateOfBirth: body.dateOfBirth,
      gender: body.gender,
      bloodGroup: body.bloodGroup,
      emergencyContact: body.emergencyContact,
    },
  })

  return NextResponse.json({ message: "Profile updated", profile: updatedProfile })
}