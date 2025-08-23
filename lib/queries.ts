"use server";

import { User } from "@prisma/client";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
const HASH_VALUE = 10;

export async function createUser(data: User) {
  const password = await bcrypt.hash(data.password, HASH_VALUE);

  await prisma.user.create({
    data: {
      age: data.age,
      birthday: data.birthday,
      email: data.email,
      firstname: data.firstname,
      lastname: data.lastname,
      password,
      role: data.role,
      section: data.section,
      name: data.name,
    },
  });
}
