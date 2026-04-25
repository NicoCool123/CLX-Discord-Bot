import { cookies } from 'next/headers';
import type { Locale } from './dict';

export async function getLocale(): Promise<Locale> {
  const jar = await cookies();
  const val = jar.get('locale')?.value;
  return val === 'de' ? 'de' : 'en';
}
