"use server";

import bcrypt from "bcryptjs";
import { signIn as authSignIn } from "@/lib/auth";
import { db } from "@/lib/db";
import { signUpSchema, signInSchema, type SignInValues, type SignUpValues } from "@/schemas/auth";
import { AuthError } from "next-auth";

export async function signUp(values: SignUpValues) {
  const validated = signUpSchema.safeParse(values);
  if (!validated.success) {
    return { error: "Invalid fields" };
  }

  const { name, email, password } = validated.data;

  const existingUser = await db.user.findUnique({ where: { email } });
  if (existingUser) {
    return { error: "Email already in use" };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      emailVerified: new Date(), // Auto-verify for now
    },
  });

  return { success: "Account created! Please sign in." };
}

export async function signInWithCredentials(values: SignInValues) {
  const validated = signInSchema.safeParse(values);
  if (!validated.success) {
    return { error: "Invalid fields" };
  }

  const { email, password } = validated.data;

  try {
    await authSignIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password" };
        default:
          return { error: "Something went wrong" };
      }
    }
    throw error;
  }

  return { success: "Signed in!" };
}

export async function signInWithProvider(provider: "google" | "github") {
  await authSignIn(provider, { redirectTo: "/dashboard" });
}
