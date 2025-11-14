import Image from 'next/image';
import prisma from '../lib/prisma';

export default async function Home() {
	// fetch products, images, prices (same as before)
	let products: any[] = [];
	try {
		products = await (prisma as any).product.findMany({ where: { inStock: true }, orderBy: { slug: 'asc' }, take: 50 });
	} catch { products = []; }

	const productIds = products.map((p) => p.id);

	let images: any[] = [];
	if (productIds.length > 0) {
		try {
			images = await (prisma as any).productImage.findMany({ where: { productId: { in: productIds } }, orderBy: { sortOrder: 'asc' } });
		} catch { images = []; }
	}

	let prices: any[] = [];
	if (productIds.length > 0) {
		try {
			prices = await (prisma as any).price.findMany({ where: { productId: { in: productIds }, active: true }, orderBy: { startsAt: 'desc' } });
		} catch { prices = []; }
	}

	const imagesByProduct = new Map<string | number, any[]>();
	for (const img of images) {
		const key = img.productId;
		if (!imagesByProduct.has(key)) imagesByProduct.set(key, []);
		imagesByProduct.get(key)!.push(img);
	}
	const priceByProduct = new Map<string | number, any>();
	for (const pr of prices) {
		if (!priceByProduct.has(pr.productId)) priceByProduct.set(pr.productId, pr);
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
						const firstImage = imgs.length > 0 ? imgs.find((i: any) => Number(i.sortOrder) === 1) ?? imgs[0] : null;
						const firstImageUrl = firstImage?.url ?? null;
						const apiFallback = `/api/image/${p.id}?index=1`;
						const tileSrc = firstImageUrl && (firstImageUrl.startsWith('/') || firstImageUrl.startsWith('http')) ? firstImageUrl : apiFallback;

						const priceRecord = priceByProduct.get(p.id) ?? null;
						let priceDisplay = '';
						if (priceRecord && typeof priceRecord.amountCents === 'number') {
							priceDisplay = `${(priceRecord.amountCents / 100).toFixed(2)} ${p.currency ?? ''}`;
						}

						return (
							<a key={p.id} href={`/product/${p.id}`} className="product-card" aria-label={p.name ?? p.slug}>
								<div className="product-image">
									{tileSrc.startsWith('http') ? <img src={tileSrc} alt={p.name ?? 'Product'} /> : <Image src={tileSrc} alt={p.name ?? 'Product'} fill style={{ objectFit: 'cover' }} />}
								</div>

								<div className="product-info">
									<h3 className="product-name">{(p.name && p.name.trim()) ? p.name.trim() : (p.slug ?? `Product ${p.id}`)}</h3>
									{priceDisplay ? <div className="product-price">{priceDisplay}</div> : <div style={{ color: '#666', marginTop: 6 }}>Price unavailable</div>}
								</div>
							</a>
						);
					})
				)}
			</div>
		</section>
	);
}
