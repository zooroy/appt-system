import { headers } from 'next/headers';

export async function verifyAdmin(): Promise<void> {
  const headersList = await headers();
  const auth = headersList.get('authorization');

  if (!auth?.startsWith('Basic ')) throw new Error('Unauthorized');

  const [user, pass] = Buffer.from(auth.slice(6), 'base64').toString().split(':');
  const validUser = process.env.ADMIN_USERNAME ?? 'admin';
  const validPass = process.env.ADMIN_PASSWORD ?? '';

  if (user !== validUser || pass !== validPass) throw new Error('Unauthorized');
}
