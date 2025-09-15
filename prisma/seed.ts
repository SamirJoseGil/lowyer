import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function seed() {
  console.log("🌱 Seeding database...");

  // Create roles if they don't exist
  const roles = [
    { name: "superadmin", description: "Super administrator with all permissions" },
    { name: "admin", description: "Administrator" },
    { name: "abogado", description: "Lawyer" },
    { name: "usuario", description: "End user" },
  ];

  for (const role of roles) {
    await db.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
  }

  // Create default licenses
  const licenses = [
    {
      name: "Trial Gratuito",
      type: "trial",
      hoursTotal: 2.0,
      validityDays: 7,
      appliesTo: "both",
      priceCents: BigInt(0),
    },
    {
      name: "Plan Básico",
      type: "standard",
      hoursTotal: 10.0,
      validityDays: 30,
      appliesTo: "both",
      priceCents: BigInt(5000000), // $50,000 COP
    },
    {
      name: "Plan Estándar",
      type: "standard",
      hoursTotal: 25.0,
      validityDays: 60,
      appliesTo: "both",
      priceCents: BigInt(12000000), // $120,000 COP
    },
    {
      name: "Plan Premium",
      type: "premium",
      hoursTotal: 50.0,
      validityDays: 90,
      appliesTo: "both",
      priceCents: BigInt(20000000), // $200,000 COP
    },
  ];

  for (const license of licenses) {
    await db.license.upsert({
      where: { name: license.name },
      update: {},
      create: license,
    });
  }

  console.log("✅ Database seeded successfully!");
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });