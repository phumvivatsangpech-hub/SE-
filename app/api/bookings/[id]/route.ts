import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
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

    const resolvedParams = await params;
    const bookingId = resolvedParams.id;
    const { photoBeforeUrl, photoAfterUrl, status } = await req.json();

    // Verify ownership
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.userId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const dataToUpdate: any = {};
    if (photoBeforeUrl) dataToUpdate.photoBeforeUrl = photoBeforeUrl;
    if (photoAfterUrl) dataToUpdate.photoAfterUrl = photoAfterUrl;
    
    // Auto complete booking if both photos are submitted
    if (photoAfterUrl || (booking.photoBeforeUrl && photoAfterUrl)) {
        dataToUpdate.status = "COMPLETED";
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: dataToUpdate
    });

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error("Failed to update booking", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
