import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const usersCount = await db.user.count()

    return NextResponse.json({
      totalUsers: usersCount,
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    )
  }
}