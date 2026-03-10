import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { PrismaClient } from "@prisma/client";
import { format, startOfDay, endOfDay } from "date-fns";

const prisma = new PrismaClient();

// In production, we'd import authOptions from auth.ts
// But because of App Router structure, we fetch session directly.
export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "ต้องเข้าสู่ระบบก่อนทำการจอง" }, { status: 401 });
    }

    const { date, startTime, endTime, faculty, studentId } = await req.json();

    if (!date || !startTime || !endTime || !faculty || !studentId) {
      return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบถ้วน" }, { status: 400 });
    }

    const bookingDate = new Date(date);
    const startHour = parseInt(startTime);
    const endHour = parseInt(endTime);
    
    // 1. Validation: Business Hours
    if (startHour < 9 || endHour > 21) {
      return NextResponse.json({ error: "การจองต้องอยู่ในช่วงเวลา 09:00 - 21:00 น." }, { status: 400 });
    }

    // 2. Validation: Duration per booking
    const duration = endHour - startHour;
    if (duration > 3 || duration < 1) {
      return NextResponse.json({ error: "จองได้ครั้งละ 1-3 ชั่วโมงเท่านั้น" }, { status: 400 });
    }

    // Get User
    let user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "ไม่พบข้อมูลผู้ใช้" }, { status: 404 });
    }

    // Update User data if they provided Faculty and StudentID for the first time
    if (!user.studentId || !user.faculty) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { studentId, faculty }
      });
    }

    // 3. Validation: Overlapping bookings on the exact same date
    const existingDateings = await prisma.booking.findMany({
      where: {
        date: {
          gte: startOfDay(bookingDate),
          lte: endOfDay(bookingDate),
        },
        status: { not: "CANCELLED" }
      }
    });

    const isOverlapping = existingDateings.some((b: any) => {
      const existingStart = parseInt(b.startTime);
      const existingEnd = parseInt(b.endTime);
      // Logic: (NewStart < OldEnd) AND (NewEnd > OldStart) means they overlap
      return startHour < existingEnd && endHour > existingStart;
    });

    if (isOverlapping) {
      return NextResponse.json({ error: "ช่วงเวลานี้มีการจองไปแล้ว กรุณาเลือกเวลาอื่น" }, { status: 400 });
    }

    // 4. Validation: Max 3 hours per user per day
    const userBookingsToday = existingDateings.filter((b: any) => b.userId === user!.id);
    const totalHoursToday = userBookingsToday.reduce((total: number, b: any) => {
      return total + (parseInt(b.endTime) - parseInt(b.startTime));
    }, 0);

    if (totalHoursToday + duration > 3) {
      return NextResponse.json({ 
        error: `คุณจองไปแล้ว ${totalHoursToday} ชั่วโมง วันนี้คุณสามารถจองเพิ่มได้อีก ${3 - totalHoursToday} ชั่วโมงเท่านั้น`
      }, { status: 400 });
    }

    // 5. Create Booking
    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        date: bookingDate,
        startTime,
        endTime,
      }
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error("Booking creation error:", error);
    return NextResponse.json({ error: "เซิร์ฟเวอร์ขัดข้อง กรุณาลองใหม่อีกครั้ง" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get('date');

    const queryDate = dateStr ? new Date(dateStr) : new Date();

    const bookings = await prisma.booking.findMany({
      where: {
        date: {
          gte: startOfDay(queryDate),
          lte: endOfDay(queryDate),
        },
        status: { not: "CANCELLED" }
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true
          }
        }
      },
      orderBy: {
        startTime: 'asc'
      }
    });

    return NextResponse.json(bookings);
  } catch (error) {
    return NextResponse.json({ error: "Fail to fetch bookings" }, { status: 500 });
  }
}
