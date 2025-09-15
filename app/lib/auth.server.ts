import bcrypt from "bcryptjs";
import { db } from "./db.server";
import { getUserId, logout } from "./session.server";
import { autoCreateTrialOnRegistration } from "./trial.server";

export type { User, Profile } from "@prisma/client";

export async function getUserById(id: string) {
  return db.user.findUnique({
    where: { id },
    include: {
      profile: true,
      role: true,
    },
  });
}

export async function getUserByEmail(email: string) {
  return db.user.findUnique({
    where: { email: email.toLowerCase() },
    include: {
      profile: true,
      role: true,
    },
  });
}

export async function createUser({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  console.log(`👤 Creating new user: ${email}`);
  
  const hashedPassword = await bcrypt.hash(password, 10);

  // Get the "usuario" role id - if it doesn't exist, create it
  let usuarioRole = await db.role.findUnique({
    where: { name: "usuario" },
  });

  if (!usuarioRole) {
    console.log(`🔧 Creating 'usuario' role as it doesn't exist`);
    usuarioRole = await db.role.create({
      data: {
        name: "usuario",
        description: "Usuario estándar de la plataforma",
      },
    });
    console.log(`✅ 'usuario' role created`);
  }

  const user = await db.user.create({
    data: {
      email: email.toLowerCase(),
      roleId: usuarioRole.id,
      profile: {
        create: {},
      },
      passwordHash: hashedPassword,
    },
    include: {
      profile: true,
      role: true,
    },
  });

  console.log(`✅ User created successfully: ${user.id}`);

  // Crear trial automáticamente para nuevos usuarios
  console.log(`🎁 Attempting to create auto-trial for new user ${user.id}`);
  await autoCreateTrialOnRegistration(user.id);

  return user;
}

export async function verifyLogin(email: string, password: string) {
  console.log(`🔐 Login attempt for email: ${email}`);
  
  const userWithPassword = await db.user.findUnique({
    where: { email: email.toLowerCase() },
    select: {
      id: true,
      email: true,
      passwordHash: true,
    },
  });

  if (!userWithPassword || !userWithPassword.passwordHash) {
    console.log(`❌ Login failed for ${email}: User not found or no password`);
    return null;
  }

  const isValid = await bcrypt.compare(password, userWithPassword.passwordHash);

  if (!isValid) {
    console.log(`❌ Login failed for ${email}: Invalid password`);
    return null;
  }

  console.log(`✅ Login successful for ${email}`);
  return { id: userWithPassword.id, email: userWithPassword.email };
}

export async function getUser(request: Request) {
  const userId = await getUserId(request);
  if (userId === null) return null;

  const user = await getUserById(userId);
  if (user) return user;

  throw await logout(request);
}

export async function requireUser(request: Request) {
  const user = await getUser(request);
  if (!user) {
    throw await logout(request);
  }
  return user;
}