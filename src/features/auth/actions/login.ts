'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { err, type Result } from '@/lib/types/result';

const LoginSchema = z.object({
  email: z.string().email('正しいメールアドレスを入力してください'),
  password: z.string().min(1, 'パスワードは必須です'),
});

export async function login(input: unknown): Promise<Result<void>> {
  const parsed = LoginSchema.safeParse(input);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? 'Invalid input';
    return err(new Error(msg));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return err(new Error('メールアドレスまたはパスワードが正しくありません'));
  }

  redirect('/dashboard');
}
