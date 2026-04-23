'use server';

import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { signIn } from '@/lib/auth';
import { db } from '@/lib/db/client';
import { users } from '@/lib/db/schema';
import { err, type Result } from '@/lib/types/result';
import { AuthError } from 'next-auth';

const SignupSchema = z.object({
  email: z.string().email('正しいメールアドレスを入力してください'),
  password: z.string().min(8, 'パスワードは8文字以上で入力してください'),
});

export async function signup(input: unknown): Promise<Result<void>> {
  const parsed = SignupSchema.safeParse(input);
  if (!parsed.success) {
    return err(new Error(parsed.error.issues[0]?.message ?? 'Invalid input'));
  }

  const { email, password } = parsed.data;

  const existing = await db.query.users.findFirst({
    where: eq(users.email, email),
  });
  if (existing) return err(new Error('このメールアドレスは既に登録されています'));

  const passwordHash = await bcrypt.hash(password, 12);

  await db.insert(users).values({
    email,
    passwordHash,
    name: email.split('@')[0],
  });

  try {
    await signIn('credentials', {
      email,
      password,
      redirectTo: '/dashboard',
    });
  } catch (e) {
    if (e instanceof AuthError) {
      return err(new Error('アカウント作成後のログインに失敗しました'));
    }
    throw e; // Re-throw redirect errors
  }

  return err(new Error('Unexpected'));
}
