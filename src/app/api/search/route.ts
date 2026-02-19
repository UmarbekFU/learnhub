import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") || "";
  if (q.length < 2) return NextResponse.json({ courses: [], categories: [] });

  const [courses, categories] = await Promise.all([
    db.course.findMany({
      where: {
        status: "PUBLISHED",
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, title: true, slug: true },
      take: 5,
    }),
    db.category.findMany({
      where: { name: { contains: q, mode: "insensitive" } },
      select: { id: true, name: true, slug: true },
      take: 3,
    }),
  ]);

  return NextResponse.json({ courses, categories });
}
