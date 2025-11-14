import prisma from '../../../../lib/prisma';
import ProductCarousel from '../../../../components/ProductCarousel';
import Link from 'next/link';

export default async function ProductPage({ params }: { params: { id: string } }) {
	const { id } = params;
	const numericId = Number(id);
	const where = !Number.isNaN(numericId) ? { id: numericId } : { id };

	// fetch product
	const product = await (prisma as any).product.findUnique({ where });
	if (!product) {
		return (
			<main style={{ padding: 24 }}>
				<h1>Product not found</h1>
				<Link href="/">Back</Link>
			</main>
		);
	}

	// fetch images ordered by sortOrder
	const images = await (prisma as any).productImage.findMany({
		where: { productId: product.id },
		orderBy: { sortOrder: 'asc' },
		select: { id: true, sortOrder: true, url: true }
	});

	// fetch active price
	const priceRecord = await (prisma as any).price.findFirst({
		where: { productId: product.id, active: true },
		orderBy: { startsAt: 'desc' }
	});

	const priceDisplay = priceRecord && typeof priceRecord.amountCents === 'number' ? `${(priceRecord.amountCents / 100).toFixed(2)} ${product.currency ?? ''}` : null;

	return (
		<main style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
			<Link href="/" style={{ display: 'inline-block', marginBottom: 12 }}>
				← Back
			</Link>

			{/* Full product header: name + price */}
			<h1 style={{ marginBottom: 12 }}>{product.name ?? product.slug}</h1>
			{priceDisplay && <div style={{ marginBottom: 12, color: '#0a7', fontWeight: 600 }}>{priceDisplay}</div>}

			{/* Carousel: all images */}
			<ProductCarousel productId={product.id} images={images} />

			{/* Full product text details */}
			<section style={{ marginTop: 24 }}>
				{product.short && <p style={{ fontWeight: 600 }}>{product.short}</p>}
				{product.description && <p style={{ whiteSpace: 'pre-wrap' }}>{product.description}</p>}
			</section>
		</main>
	);
}
