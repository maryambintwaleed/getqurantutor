import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { seedCourses } from "./courses";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

seedCourses(db)
  .then((ids) => console.log(`Courses ready: ${Object.keys(ids).length}`))
  .finally(() => db.$disconnect());
