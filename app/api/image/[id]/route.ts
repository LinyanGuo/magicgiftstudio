import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import fs from 'fs/promises';
import path from 'path';

// 强制使用 Node.js runtime，并且标记为动态，避免静态预渲染
export const runtime = 'nodejs';
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

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const url = new URL(req.url);

  // index 是 1-based，因为 sortOrder 从 1 开始。默认取第 1 张图。
  const indexParam = url.searchParams.get('index');
  const index1 = indexParam
    ? Math.max(1, Math.floor(Number(indexParam) || 1))
    : 1;

  // 兼容 productId 既可能是数字也可能是字符串
  const maybeNum = Number(id);
  const productIdWhere = !Number.isNaN(maybeNum) ? maybeNum : id;

  // 1. 从数据库里拿这个商品的所有图片（按 sortOrder 升序）
  let imgs: any[] = [];
  try {
    imgs = await (prisma as any).productImage.findMany({
      where: { productId: productIdWhere },
      orderBy: { sortOrder: 'asc' },
      select: { id: true, url: true, sortOrder: true },
    });
  } catch (e) {
    console.error('prisma productImage lookup error', e);
  }

  // 如果这个商品没有图片，跳回到 /public/products/placeholder.jpg
  if (!imgs || imgs.length === 0) {
    const fallbackAbs = new URL('/products/placeholder.jpg', req.url);
    return NextResponse.redirect(fallbackAbs, 307);
  }

  // 优先找 sortOrder == index1 的那张图
  let chosen = imgs.find((im) => Number(im.sortOrder) === index1);

  // 找不到就按位置选：index1 - 1（下标从 0 开始）
  if (!chosen) {
    const pos = Math.min(Math.max(0, index1 - 1), imgs.length - 1);
    chosen = imgs[pos];
  }

  // 如果还找不到，就用第一张
  if (!chosen) {
    chosen = imgs[0];
  }

  const imageField: string = chosen?.url;

  if (!imageField) {
    const fallbackAbs = new URL('/products/placeholder.jpg', req.url);
    return NextResponse.redirect(fallbackAbs, 307);
  }

  // 2. 如果是以 / 开头的 public 资源路径，直接 307 redirect 到绝对地址
  if (imageField.startsWith('/')) {
    const absolute = new URL(imageField, req.url);
    return NextResponse.redirect(absolute, 307);
  }

  // 3. 如果是完整的 http(s) URL，直接 307 redirect
  if (imageField.startsWith('http://') || imageField.startsWith('https://')) {
    return NextResponse.redirect(imageField, 307);
  }

  // 4. 否则认为是文件系统路径/相对路径，从磁盘读取二进制内容返回
  try {
    let resolvedPath = imageField;
    // 如果既不是绝对路径，也不是以 / 开头，则认为是相对路径，挂在 public 下
    if (!path.isAbsolute(imageField) && !imageField.startsWith('/')) {
      resolvedPath = path.join(process.cwd(), 'public', imageField);
    }

    const data = await fs.readFile(resolvedPath);
    const ext = path.extname(resolvedPath);
    const contentType = getContentType(ext);

    return new Response(new Uint8Array(data), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (err) {
    console.warn(
      'Failed to read image file; falling back to placeholder:',
      err
    );
    const fallbackAbs = new URL('/products/placeholder.jpg', req.url);
    return NextResponse.redirect(fallbackAbs, 307);
  }
}
