import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request, { params }: { params: Promise<{ postId: string }> }) {
  try {
    const session = await getServerSession();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content } = await req.json();

    if (!content) {
      return NextResponse.json({ error: "กรุณากรอกข้อความ" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const resolvedParams = await params;
    const postId = resolvedParams.postId;

    const comment = await prisma.comment.create({
      data: {
        postId,
        userId: user.id,
        content
      },
      include: {
        user: { select: { name: true, image: true } }
      }
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Comment creation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
