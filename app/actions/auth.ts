'use server'

import { signOut } from '@/lib/auth'

/** Oturumu kapat → landing'e dön */
export async function logoutAction() {
  await signOut({ redirectTo: '/' })
}
