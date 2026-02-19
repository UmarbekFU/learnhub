import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create categories
  const categories = [
    { name: "Web Development", slug: "web-development", icon: "Globe" },
    { name: "Mobile Development", slug: "mobile-development", icon: "Smartphone" },
    { name: "Data Science", slug: "data-science", icon: "BarChart3" },
    { name: "Machine Learning", slug: "machine-learning", icon: "Brain" },
    { name: "DevOps", slug: "devops", icon: "Server" },
    { name: "Design", slug: "design", icon: "Palette" },
    { name: "Business", slug: "business", icon: "Briefcase" },
    { name: "Marketing", slug: "marketing", icon: "Megaphone" },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }

  // Create admin user
  const hashedPassword = await bcrypt.hash("Admin123!", 10);

  await prisma.user.upsert({
    where: { email: "admin@learnhub.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@learnhub.com",
      password: hashedPassword,
      role: "ADMIN",
      emailVerified: new Date(),
    },
  });

  // Create instructor user
  await prisma.user.upsert({
    where: { email: "instructor@learnhub.com" },
    update: {},
    create: {
      name: "Jane Instructor",
      email: "instructor@learnhub.com",
      password: hashedPassword,
      role: "INSTRUCTOR",
      emailVerified: new Date(),
      headline: "Senior Full-Stack Developer",
      bio: "10+ years of experience in web development. Teaching since 2018.",
    },
  });

  // Create student user
  await prisma.user.upsert({
    where: { email: "student@learnhub.com" },
    update: {},
    create: {
      name: "John Student",
      email: "student@learnhub.com",
      password: hashedPassword,
      role: "STUDENT",
      emailVerified: new Date(),
    },
  });

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
