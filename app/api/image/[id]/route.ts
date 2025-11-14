import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  // 直接返回 placeholder，保证构建成功
  const fallbackAbs = new URL('/products/placeholder.jpg', req.url);
  return NextResponse.redirect(fallbackAbs, 307);
}
