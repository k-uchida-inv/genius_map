'use server';

import { signIn } from '@/lib/auth';

export async function oauthLogin() {
  await signIn('google', { redirectTo: '/dashboard' });
}
