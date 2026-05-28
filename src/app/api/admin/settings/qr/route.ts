import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function GET() {
  const qr = await prisma.paymentQR.findFirst({ where: { isActive: true } });
  return NextResponse.json(qr);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN","SUPER_ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "ບໍ່ມີສິດ" }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("qr") as File | null;
  const keepExisting = formData.get("keepExisting") === "true";
  const bankName = formData.get("bankName") as string;
  const accountName = formData.get("accountName") as string;
  const accountNumber = (formData.get("accountNumber") as string) || "";

  if (!bankName || !accountName) {
    return NextResponse.json({ error: "ກະລຸນາໃສ່ທະນາຄານ ແລະ ຊື່ບັນຊີ" }, { status: 400 });
  }

  // If keeping existing image, just update bank details on the active QR
  if (keepExisting && !file) {
    const existing = await prisma.paymentQR.findFirst({ where: { isActive: true } });
    if (!existing) {
      return NextResponse.json({ error: "ບໍ່ພົບ QR" }, { status: 404 });
    }
    const updated = await prisma.paymentQR.update({
      where: { id: existing.id },
      data: { bankName, accountName, accountNumber },
    });
    return NextResponse.json(updated);
  }

  if (!file) {
    return NextResponse.json({ error: "ກະລຸນາອັບໂຫລດຮູບ QR" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const ext = file.name.split(".").pop();
  const filename = `qr_${Date.now()}.${ext}`;
  const uploadDir = path.join(process.cwd(), "public/uploads/qr");

  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), buffer);

  // deactivate old QRs
  await prisma.paymentQR.updateMany({ data: { isActive: false } });

  const qr = await prisma.paymentQR.create({
    data: {
      image: `/uploads/qr/${filename}`,
      bankName,
      accountName,
      accountNumber,
      isActive: true,
    },
  });

  return NextResponse.json(qr);
}
