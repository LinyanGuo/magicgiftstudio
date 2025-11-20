import Image from 'next/image';
import prisma from '../lib/prisma';

export const fetchCache = 'force-no-store';
export const revalidate = 0;


// 关键：告诉 Next 这个页面是动态的，只在请求时渲染
export const dynamic = 'force-dynamic';
// 关键：强制使用 Node.js runtime，而不是 Edge（Prisma 在 Edge 下不工作）
export const runtime = 'nodejs';

type Product = {
  id: number | string;
  name: string | null;
  slug: string | null;
  currency: string | null;
  inStock?: boolean | null;
};

type ProductImage = {
  id: number | string;
  productId: number | string;
  url: string;
  sortOrder: number | null;
};

type Price = {
  id: number | string;
  productId: number | string;
  amountCents: number | null;
  startsAt: Date | string | null;
  active: boolean;
};

// 单独封装成函数，避免在模块顶层直接操作 Prisma
async function getProducts(): Promise<Product[]> {
  try {
    const products = await (prisma as any).product.findMany({
      where: { inStock: true },
      orderBy: { slug: 'asc' },
      take: 50,
    });
    return products ?? [];
  } catch (err) {
    console.error('getProducts error', err);
    return [];
  }
}

async function getImages(productIds: Array<number | string>): Promise<ProductImage[]> {
  if (productIds.length === 0) return [];
  try {
    const images = await (prisma as any).productImage.findMany({
      where: { productId: { in: productIds } },
      orderBy: { sortOrder: 'asc' },
    });
    return images ?? [];
  } catch (err) {
    console.error('getImages error', err);
    return [];
  }
}

async function getPrices(productIds: Array<number | string>): Promise<Price[]> {
  if (productIds.length === 0) return [];
  try {
    const prices = await (prisma as any).price.findMany({
      where: { productId: { in: productIds }, active: true },
      orderBy: { startsAt: 'desc' },
    });
    return prices ?? [];
  } catch (err) {
    console.error('getPrices error', err);
    return [];
  }
}

export default async function Home() {
  // 1. 取产品
  const products = await getProducts();
  const productIds = products.map((p) => p.id);

  // 2. 取图片和价格
  const [images, prices] = await Promise.all([
    getImages(productIds),
    getPrices(productIds),
  ]);

  // 3. 整理到 map 里方便查
  const imagesByProduct = new Map<string | number, ProductImage[]>();
  for (const img of images) {
    const key = img.productId;
    if (!imagesByProduct.has(key)) imagesByProduct.set(key, []);
    imagesByProduct.get(key)!.push(img);
  }

  const priceByProduct = new Map<string | number, Price>();
  for (const pr of prices) {
    if (!priceByProduct.has(pr.productId)) {
      priceByProduct.set(pr.productId, pr);
    }
  }

  return (
    <section>
      <div className="contact-tag-left">
        <img src="/products/contact-tag-full.png" alt="Contact Tag" />
      </div>

      <h2 style={{ margin: '8px 0 16px' }}>Featured products</h2>

      <div className="product-grid">
        {products.length === 0 ? (
          <div style={{ color: '#666' }}>No products found.</div>
        ) : (
          products.map((p: any) => {
            const imgs = imagesByProduct.get(p.id) || [];
            const firstImage =
              imgs.length > 0
                ? imgs.find((i: any) => Number(i.sortOrder) === 1) ?? imgs[0]
                : null;
            const firstImageUrl = firstImage?.url ?? null;

            const apiFallback = `/api/image/${p.id}?index=1`;
            const tileSrc =
              firstImageUrl &&
              (firstImageUrl.startsWith('/') || firstImageUrl.startsWith('http'))
                ? firstImageUrl
                : apiFallback;

            const priceRecord = priceByProduct.get(p.id) ?? null;
            let priceDisplay = '';
            if (priceRecord && typeof priceRecord.amountCents === 'number') {
              priceDisplay = `${(priceRecord.amountCents / 100).toFixed(2)} ${
                p.currency ?? ''
              }`;
            }

            return (
              <a
                key={p.id}
                href={`/product/${p.id}`}
                className="product-card"
                aria-label={p.name ?? p.slug}
              >
                <div className="product-image">
                  {tileSrc.startsWith('http') ? (
                    <img src={tileSrc} alt={p.name ?? 'Product'} />
                  ) : (
                    <Image
                      src={tileSrc}
                      alt={p.name ?? 'Product'}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  )}
                </div>

                <div className="product-info">
                  <h3 className="product-name">
                    {p.name && p.name.trim()
                      ? p.name.trim()
                      : p.slug ?? `Product ${p.id}`}
                  </h3>
                  {priceDisplay ? (
                    <div className="product-price">{priceDisplay}</div>
                  ) : (
                    <div style={{ color: '#666', marginTop: 6 }}>
                      Price unavailable
                    </div>
                  )}
                </div>
              </a>
            );
          })
        )}
      </div>
    </section>
  );
}
