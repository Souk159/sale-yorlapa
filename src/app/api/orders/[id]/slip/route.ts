import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "ກະລຸນາເຂົ້າສູ່ລະບົບ" }, { status: 401 });

  const { id } = await params;

  const order = await prisma.order.findUnique({ where: { id, userId: session.user.id } });
  if (!order) return NextResponse.json({ error: "ບໍ່ພົບ order" }, { status: 404 });

  const formData = await req.formData();
  const file = formData.get("slip") as File;
  if (!file) return NextResponse.json({ error: "ກະລຸນາອັບໂຫລດຮູບ" }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const ext = file.name.split(".").pop();
  const filename = `slip_${id}_${Date.now()}.${ext}`;
  const uploadDir = path.join(process.cwd(), "public/uploads/slips");

  const { mkdir } = await import("fs/promises");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), buffer);

  const updated = await prisma.order.update({
    where: { id },
    data: {
      slipImage: `/uploads/slips/${filename}`,
      slipUploadedAt: new Date(),
      status: "SLIP_UPLOADED",
    },
  });

  return NextResponse.json(updated);
}
