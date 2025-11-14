import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import fs from 'fs/promises';
import path from 'path';

// 👇 强制这个 API 在 Node.js runtime 下运行，而不是 Edge
export const runtime = 'nodejs';
// 👇 明确声明是动态的，避免任何静态预渲染尝试
export const dynamic = 'force-dynamic';

function getContentType(ext: string) {
  ext = ext.toLowerCase();
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.png') return 'image/png';
  if (ext === '.webp') return 'image/webp';
  if (ext === '.gif') return 'image/gif';
  if (ext === '.svg') return 'image/svg+xml';
  return 'application/octet-stream';
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const url = new URL(req.url);
  // index is 1-based because sortOrder starts at 1. Default to 1 (first image).
  const indexParam = url.searchParams.get('index');
  const index1 = indexParam ? Math.max(1, Math.floor(Number(indexParam) || 1)) : 1;

  // normalize productId type: try numeric then fallback to string
  const maybeNum = Number(id);
  const productIdWhere = !Number.isNaN(maybeNum) ? maybeNum : id;

  // Fetch all images for this product ordered by sortOrder asc
  let imgs: any[] = [];
  try {
    imgs = await (prisma as any).productImage.findMany({
      where: { productId: productIdWhere },
      orderBy: { sortOrder: 'asc' },
      select: { id: true, url: true, sortOrder: true }
    });
  } catch (e) {
    console.error('prisma productImage lookup error', e);
  }

  if (!imgs || imgs.length === 0) {
    // no images for this product -> fallback to placeholder in /public
    const fallbackAbs = new URL('/products/placeholder.jpg', req.url);
    return NextResponse.redirect(fallbackAbs, 307);
  }

  // Prefer image whose sortOrder exactly equals index1 (since sortOrder starts at 1)
  let chosen = imgs.find((im) => Number(im.sortOrder) === index1);

  // If not found, fallback to positional selection: index1 - 1 (clamped)
  if (!chosen) {
    const pos = Math.min(Math.max(0, index1 - 1), imgs.length - 1);
    chosen = imgs[pos];
  }

  // If still not found (very unlikely), pick first
  if (!chosen) {
    chosen = imgs[0];
  }

  const imageField: string = chosen?.url;

  if (!imageField) {
    const fallbackAbs = new URL('/products/placeholder.jpg', req.url);
    return NextResponse.redirect(fallbackAbs, 307);
  }

  // If the stored value is a public-relative path (starts with /), redirect to absolute URL
  if (imageField.startsWith('/')) {
    const absolute = new URL(imageField, req.url);
    return NextResponse.redirect(absolute, 307);
  }

  // If the stored value is an HTTP(S) URL, redirect to it
  if (imageField.startsWith('http://') || imageField.startsWith('https://')) {
    return NextResponse.redirect(imageField, 307);
  }

  // Otherwise assume it's a filesystem path or project-relative path; try to read and return bytes
  try {
    let resolvedPath = imageField;
    // if relative (no drive letter and does not start with '/'), resolve under project public/
    if (!path.isAbsolute(imageField) && !imageField.startsWith('/')) {
      resolvedPath = path.join(process.cwd(), 'public', imageField);
    }
    const data = await fs.readFile(resolvedPath);
    const ext = path.extname(resolvedPath);
    const contentType = getContentType(ext);
    // Convert Node Buffer to Uint8Array so Response body type matches DOM BodyInit
    return new Response(new Uint8Array(data), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600'
      }
    });
  } catch (err) {
    console.warn(
      'Failed to read image file; falling back to placeholder or remote if possible:',
      err
    );
    // final fallback: redirect to placeholder
    const fallbackAbs = new URL('/products/placeholder.jpg', req.url);
    return NextResponse.redirect(fallbackAbs, 307);
  }
}
