/**
 * ໃຊ້: npx ts-node scripts/make-superadmin.ts <email>
 * ຕົວຢ່າງ: npx ts-node scripts/make-superadmin.ts soukthunva152@gmail.com
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("ກະລຸນາໃສ່ email: npx ts-node scripts/make-superadmin.ts <email>");
    process.exit(1);
  }

  const user = await prisma.user.update({
    where: { email },
    data: { role: "SUPER_ADMIN" },
  });

  console.log(`✅ ${user.name} (${user.email}) ເປັນ SUPER_ADMIN ແລ້ວ`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
