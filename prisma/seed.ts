import { PrismaClient, User } from "@prisma/client";
import path from "path";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const HASH_VALUE = 10;

async function main() {
  const data: User = {
    age: 23,
    birthday: new Date(Date.now()),
    email: "example@deped.gov.ph",
    name: "Example",
    password: "test123",
    role: "Teacher",
    firstname: null,
    lastname: null,
    createdAt: new Date(Date.now()),
    isDeleted: false,
    id: "1",
    section: "",
    updatedAt: new Date(Date.now()),
  };

  const password = await bcrypt.hash(data.password, HASH_VALUE);
  const user = await prisma.user.upsert({
    where: { email: data.email },
    update: {
      lastname: data.lastname,
      firstname: data.firstname,
      email: data.email,
      role: data.role,
    },
    create: {
      lastname: data.lastname,
      firstname: data.firstname,
      email: data.email,
      birthday: data.birthday,
      role: data.role,
      password,
      name: data.name,
      age: data.age,
      section: data.section,
    },
  });
  console.log("Teacher successfully seeded or updated!");
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
