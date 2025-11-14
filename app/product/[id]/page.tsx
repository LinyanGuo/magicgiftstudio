import prisma from '../../../lib/prisma';
import ProductCarousel from '../../../components/ProductCarousel';
import Link from 'next/link';

export default async function ProductPage({ params, searchParams }: { params: { id: string }; searchParams?: { img?: string } }) {
	const { id } = params;
	const product = await (prisma as any).product.findUnique({ where: { id: isNaN(Number(id)) ? id : Number(id) } });
	if (!product) return <main className="site-container">Product not found</main>;

	const images = await (prisma as any).productImage.findMany({ where: { productId: product.id }, orderBy: { sortOrder: 'asc' }, select: { id: true, sortOrder: true, url: true } });

	let initialIndex = 0;
	const requested = searchParams?.img ? Number(searchParams.img) : NaN;
	if (!Number.isNaN(requested)) {
		const found = images.findIndex((im: any) => Number(im.sortOrder) === requested);
		if (found >= 0) initialIndex = found;
	}

	const priceRecord = await (prisma as any).price.findFirst({ where: { productId: product.id, active: true }, orderBy: { startsAt: 'desc' } });
	const priceDisplay = priceRecord && typeof priceRecord.amountCents === 'number' ? `${(priceRecord.amountCents / 100).toFixed(2)} ${product.currency ?? ''}` : null;

	return (
		<main className="site-container product-detail">
			<div className="contact-tag-left">
				<img src="/products/contact-tag-full.png" alt="Contact Tag" />
			</div>
			<Link href="/" style={{ display: 'inline-block', marginBottom: 12 }}>← Back</Link>

			<h1>{product.name ?? product.slug}</h1>
			{priceDisplay && <div className="product-meta">{priceDisplay}</div>}

			<ProductCarousel productId={product.id} images={images} initialIndex={initialIndex} />

			<section style={{ marginTop: 24 }}>
				{product.short && <p style={{ fontWeight: 600, marginBottom: 8 }}>{product.short}</p>}
				{product.description && <p style={{ whiteSpace: 'pre-wrap' }}>{product.description}</p>}
			</section>
		</main>
	);
}
