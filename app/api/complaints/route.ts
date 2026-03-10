import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, content, photoUrl } = await req.json();

    if (!title || !content) {
      return NextResponse.json({ error: "กรุณากรอกหัวข้อและเนื้อหา" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const complaint = await prisma.complaint.create({
      data: {
        userId: user.id,
        title,
        content,
        photoUrl
      }
    });

    return NextResponse.json(complaint, { status: 201 });
  } catch (error) {
    console.error("Complaint creation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Regular users see only their complaints. Admins could potentially see all.
    const complaints = await prisma.complaint.findMany({
      where: user.role === "ADMIN" ? undefined : { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(complaints);
  } catch (error) {
    return NextResponse.json({ error: "Fail to fetch complaints" }, { status: 500 });
  }
}
