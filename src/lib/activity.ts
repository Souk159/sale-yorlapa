import { prisma } from "./prisma";
import { NextRequest } from "next/server";

export type ActionType =
  | "LOGIN"
  | "PRODUCT_CREATE" | "PRODUCT_UPDATE" | "PRODUCT_DELETE" | "PRODUCT_TOGGLE"
  | "ORDER_CREATE"   | "ORDER_STATUS"
  | "USER_ROLE"      | "USER_DELETE"    | "USER_UPDATE"
  | "CATEGORY_CREATE"| "CATEGORY_UPDATE"| "CATEGORY_DELETE"
  | "QR_UPDATE"      | "SLIP_UPLOAD";

export const ACTION_LABEL: Record<ActionType, string> = {
  LOGIN:            "ເຂົ້າສູ່ລະບົບ",
  PRODUCT_CREATE:   "ເພີ່ມສິນຄ້າ",
  PRODUCT_UPDATE:   "ແກ້ໄຂສິນຄ້າ",
  PRODUCT_DELETE:   "ລຶບສິນຄ້າ",
  PRODUCT_TOGGLE:   "ປ່ຽນສະຖານະສິນຄ້າ",
  ORDER_CREATE:     "ສ້າງ Order",
  ORDER_STATUS:     "ອັບເດດ Order",
  USER_ROLE:        "ປ່ຽນ Role ຜູ້ໃຊ້",
  USER_DELETE:      "ລຶບຜູ້ໃຊ້",
  USER_UPDATE:      "ແກ້ໄຂຜູ້ໃຊ້",
  CATEGORY_CREATE:  "ເພີ່ມໝວດ",
  CATEGORY_UPDATE:  "ແກ້ໄຂໝວດ",
  CATEGORY_DELETE:  "ລຶບໝວດ",
  QR_UPDATE:        "ອັບເດດ QR",
  SLIP_UPLOAD:      "ອັບໂຫລດ Slip",
};

export function getIP(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

export async function logActivity(params: {
  userId?: string | null;
  userName: string;
  userRole: string;
  action: ActionType;
  target?: string;
  targetId?: string;
  detail?: string;
  ip?: string;
}) {
  try {
    await prisma.activityLog.create({ data: params });
  } catch {
    // Never let logging crash the main flow
  }
}
