import prisma from '../../../lib/prisma';
import ProductCarousel from '../../../components/ProductCarousel';
import Link from 'next/link';

// 强制 Node.js runtime，避免 Edge + Prisma 的坑
export const runtime = 'nodejs';
// 强制动态渲染，避免构建时预渲染出错
export const dynamic = 'force-dynamic';

type ProductPageProps = {
  params: { id: string };
  searchParams?: { img?: string };
};

export default async function ProductPage({ params, searchParams }: ProductPageProps) {
  const { id } = params;

  // 1. 安全获取 product（带 try/catch）
  let product: any = null;
  try {
    const whereId = isNaN(Number(id)) ? id : Number(id);
    product = await (prisma as any).product.findUnique({ where: { id: whereId } });
  } catch (err) {
    console.error('Error fetching product', id, err);
    product = null;
  }

  if (!product) {
    return <main className="site-container">Product not found</main>;
  }

  // 2. 安全获取 images
  let images: any[] = [];
  try {
    images = await (prisma as any).productImage.findMany({
      where: { productId: product.id },
      orderBy: { sortOrder: 'asc' },
      select: { id: true, sortOrder: true, url: true },
    });
  } catch (err) {
    console.error('Error fetching product images', product.id, err);
    images = [];
  }

  // 3. 根据 searchParams.img 计算初始索引（做边界保护）
  let initialIndex = 0;
  if (images.length > 0) {
    const requested = searchParams?.img ? Number(searchParams.img) : NaN;
    if (!Number.isNaN(requested)) {
      const found = images.findIndex((im: any) => Number(im.sortOrder) === requested);
      if (found >= 0) {
        initialIndex = found;
      }
    }
    // 额外保护：避免 initialIndex 落到越界
    if (initialIndex < 0 || initialIndex >= images.length) {
      initialIndex = 0;
    }
  }

  // 4. 安全获取价格
  let priceDisplay: string | null = null;
  try {
    const priceRecord = await (prisma as any).price.findFirst({
      where: { productId: product.id, active: true },
      orderBy: { startsAt: 'desc' },
    });

    if (priceRecord && typeof priceRecord.amountCents === 'number') {
      priceDisplay = `${(priceRecord.amountCents / 100).toFixed(2)} ${product.currency ?? ''}`;
    }
  } catch (err) {
    console.error('Error fetching product price', product.id, err);
    priceDisplay = null;
  }

  return (
    <main className="site-container product-detail">
      <div className="contact-tag-left">
        <img src="/products/contact-tag-full.png" alt="Contact Tag" />
      </div>

      <Link href="/" style={{ display: 'inline-block', marginBottom: 12 }}>
        ← Back
      </Link>

      <h1>{product.name ?? product.slug}</h1>
      {priceDisplay && <div className="product-meta">{priceDisplay}</div>}

      {/* 如果有图片，就用轮播；否则给一个占位图，避免 ProductCarousel 收到空数组崩掉 */}
      {images.length > 0 ? (
        <ProductCarousel productId={product.id} images={images} initialIndex={initialIndex} />
      ) : (
        <div className="product-image-placeholder">
          <img src="/products/placeholder.jpg" alt="No image available" />
        </div>
      )}

      <section style={{ marginTop: 24 }}>
        {product.short && (
          <p style={{ fontWeight: 600, marginBottom: 8 }}>{product.short}</p>
        )}
        {product.description && (
          <p style={{ whiteSpace: 'pre-wrap' }}>{product.description}</p>
        )}
      </section>
    </main>
  );
}
