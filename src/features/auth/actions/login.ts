'use server';

import { z } from 'zod';
import { signIn } from '@/lib/auth';
import { err, type Result } from '@/lib/types/result';
import { AuthError } from 'next-auth';

const LoginSchema = z.object({
  email: z.string().email('正しいメールアドレスを入力してください'),
  password: z.string().min(1, 'パスワードは必須です'),
});

export async function login(input: unknown): Promise<Result<void>> {
  const parsed = LoginSchema.safeParse(input);
  if (!parsed.success) {
    return err(new Error(parsed.error.issues[0]?.message ?? 'Invalid input'));
  }

  try {
    await signIn('credentials', {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: '/dashboard',
    });
  } catch (e) {
    if (e instanceof AuthError) {
      return err(new Error('メールアドレスまたはパスワードが正しくありません'));
    }
    throw e; // Re-throw redirect errors
  }

  return err(new Error('Unexpected'));
}
