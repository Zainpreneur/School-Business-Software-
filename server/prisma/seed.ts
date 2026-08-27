import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@school.test";
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash("Admin@123", 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        firstName: "Super",
        lastName: "Admin",
        role: "SUPER_ADMIN",
      },
    });
    console.log(`Created super admin: ${adminEmail} / Admin@123`);
  } else {
    console.log("Super admin already exists, skipping.");
  }

  const subjectNames = [
    { name: "Mathematics", code: "MATH" },
    { name: "English", code: "ENG" },
    { name: "Science", code: "SCI" },
    { name: "Social Studies", code: "SST" },
    { name: "Computer Science", code: "CS" },
  ];

  for (const subject of subjectNames) {
    await prisma.subject.upsert({
      where: { code: subject.code },
      update: {},
      create: subject,
    });
  }
  console.log("Seeded subjects.");

  const classNames = ["Grade 1", "Grade 2", "Grade 3"];
  for (const name of classNames) {
    const schoolClass = await prisma.schoolClass.upsert({
      where: { name },
      update: {},
      create: { name },
    });

    for (const sectionName of ["A", "B"]) {
      await prisma.classSection.upsert({
        where: { schoolClassId_name: { schoolClassId: schoolClass.id, name: sectionName } },
        update: {},
        create: { name: sectionName, schoolClassId: schoolClass.id },
      });
    }
  }
  console.log("Seeded classes and sections.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
