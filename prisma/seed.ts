import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding...");

  // ── Users ──────────────────────────────────────────────────────────────────
  const [admin, superAdmin, customer] = await Promise.all([
    prisma.user.upsert({
      where: { email: "admin@yorlapa.com" },
      update: {},
      create: {
        name: "Admin ຢໍລະປາ",
        email: "admin@yorlapa.com",
        password: await bcrypt.hash("admin1234", 10),
        role: "ADMIN",
      },
    }),
    prisma.user.upsert({
      where: { email: "soukthunva152@gmail.com" },
      update: {},
      create: {
        name: "Super Admin",
        email: "soukthunva152@gmail.com",
        password: await bcrypt.hash("Admin@2026", 10),
        role: "SUPER_ADMIN",
      },
    }),
    prisma.user.upsert({
      where: { email: "user@yorlapa.com" },
      update: {},
      create: {
        name: "ລູກຄ້າທົດສອບ",
        email: "user@yorlapa.com",
        password: await bcrypt.hash("user1234", 10),
        role: "CUSTOMER",
        phone: "02012345678",
      },
    }),
  ]);
  console.log("✅ Users:", admin.email, "|", superAdmin.email, "|", customer.email);

  // ── Categories ─────────────────────────────────────────────────────────────
  const cats = await Promise.all([
    prisma.category.upsert({ where: { id: "cat-meat"  }, update: {}, create: { id: "cat-meat",  name: "ຊີ້ນ",      nameEn: "Meat",        icon: "🥩" } }),
    prisma.category.upsert({ where: { id: "cat-spice" }, update: {}, create: { id: "cat-spice", name: "ເຄື່ອງເທດ", nameEn: "Spices",      icon: "🌶️" } }),
    prisma.category.upsert({ where: { id: "cat-veg"   }, update: {}, create: { id: "cat-veg",   name: "ຜັກ",       nameEn: "Vegetables",  icon: "🥬" } }),
    prisma.category.upsert({ where: { id: "cat-sauce" }, update: {}, create: { id: "cat-sauce", name: "ນ້ຳຊ໋ອດ",   nameEn: "Sauce",       icon: "🫙" } }),
  ]);
  console.log("✅ Categories:", cats.length);

  // ── Products ───────────────────────────────────────────────────────────────
  const products = [
    // ເຄື່ອງເທດ
    {
      id: "prod-1",
      name: "ໝາກພິກໄທດຳ",     nameEn: "Black Pepper",
      description: "ໝາກພິກໄທດຳ ອັດສູນຍາກາດ ຄຸນນະພາບສູງ",
      categoryId: "cat-spice",  pricePerGram: 80,
      minGram: 100, maxGram: 5000, stepGram: 50,
    },
    {
      id: "prod-2",
      name: "ຂີ້ໝິ້ນ",          nameEn: "Turmeric",
      description: "ຂີ້ໝິ້ນສົດ ບົດລະອຽດ",
      categoryId: "cat-spice",  pricePerGram: 60,
      minGram: 100, maxGram: 3000, stepGram: 50,
    },
    // ຊີ້ນ
    {
      id: "prod-3",
      name: "ຊີ້ນງົວ",          nameEn: "Beef",
      description: "ຊີ້ນງົວສົດ ອັດສູນຍາກາດ",
      categoryId: "cat-meat",   pricePerGram: 120,
      minGram: 200, maxGram: 5000, stepGram: 50,
    },
    {
      id: "cmpoxl5oy0001dghzpanza6fb",
      name: "ປີກໄກ່",           nameEn: "Chicken Wings",
      description: "ປີກໄກ່ສົດຈາກໂຮງງານ",
      categoryId: "cat-meat",   pricePerGram: 5000,
      minGram: 100, maxGram: 5000, stepGram: 50,
    },
    {
      id: "cmpp4o0lh0005dgj9v0v9g12u",
      name: "ໄກ່ (ສຳຫລັບສະເຕັກ)", nameEn: "Chicken (Steak)",
      description: "ສອຍສຳຫລັບເຮັດສະເຕັກ ສົດໃໝ່",
      categoryId: "cat-meat",   pricePerGram: 200,
      minGram: 100, maxGram: 5000, stepGram: 50,
    },
    {
      id: "cmpp4rpg40009dgj9a8zf541f",
      name: "ໄກ່ກະເພົາ",         nameEn: "Chicken (KA PAO)",
      description: "ໄກ່ສຳຫລັບເຮັດກະເພົາ",
      categoryId: "cat-meat",   pricePerGram: 200,
      minGram: 100, maxGram: 5000, stepGram: 50,
    },
    // ທະເລ (ບໍ່ມີ category)
    {
      id: "cmpp4vvxa000ddgj91ca7y1ab",
      name: "ກຸ້ງ+ປາມຶກ (ເຂົ້າພັດ)", nameEn: "SEAFOOD (FR)",
      description: "ວັດຖຸດິບທະເລສຳຫລັບເຂົ້າພັດ",
      categoryId: null,          pricePerGram: 300,
      minGram: 100, maxGram: 5000, stepGram: 50,
    },
    // ຜັກ
    {
      id: "prod-4",
      name: "ຜັກສະລັດ",         nameEn: "Lettuce",
      description: "ຜັກສະລັດສົດ",
      categoryId: "cat-veg",    pricePerGram: 15,
      minGram: 200, maxGram: 2000, stepGram: 50,
    },
    // ນ້ຳຊ໋ອດ
    {
      id: "prod-5",
      name: "ນ້ຳປາ",             nameEn: "Fish Sauce",
      description: "ນ້ຳປາແທ້ ຄຸນນະພາບດີ",
      categoryId: "cat-sauce",  pricePerGram: 20,
      minGram: 500, maxGram: 5000, stepGram: 50,
    },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: {},
      create: { ...p, isVacuum: true, isActive: true },
    });
  }
  console.log("✅ Products:", products.length);

  console.log("\n🎉 Done!");
  console.log("   Super Admin : soukthunva152@gmail.com / Admin@2026");
  console.log("   Admin       : admin@yorlapa.com / admin1234");
  console.log("   Customer    : user@yorlapa.com / user1234");
}

main().catch(console.error).finally(() => prisma.$disconnect());
