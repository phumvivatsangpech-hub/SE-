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

    const { content, mediaUrl, mediaType } = await req.json();

    if (!content) {
      return NextResponse.json({ error: "กรุณากรอกข้อความ" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const post = await prisma.post.create({
      data: {
        userId: user.id,
        content,
        mediaUrl,
        mediaType: mediaType || null
      },
      include: {
        user: { select: { name: true, image: true, faculty: true } }
      }
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("Post creation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, image: true, faculty: true }
        },
        comments: {
          include: {
            user: { select: { name: true, image: true } }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    return NextResponse.json(posts);
  } catch (error) {
    return NextResponse.json({ error: "Fail to fetch posts" }, { status: 500 });
  }
}
