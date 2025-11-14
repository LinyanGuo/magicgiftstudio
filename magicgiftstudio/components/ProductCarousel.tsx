'use client';
import React, { useState, useRef } from 'react';
import Image from 'next/image';

type Img = { id: string | number; sortOrder: number; url?: string };

export default function ProductCarousel({ productId, images }: { productId: string | number; images: Img[] }) {
	const [index, setIndex] = useState(0);
	const touchStartX = useRef<number | null>(null);

	const prev = () => setIndex((i) => (i - 1 + images.length) % images.length);
	const next = () => setIndex((i) => (i + 1) % images.length);

	const onTouchStart = (e: React.TouchEvent) => {
		touchStartX.current = e.touches[0].clientX;
	};
	const onTouchEnd = (e: React.TouchEvent) => {
		if (touchStartX.current == null) return;
		const dx = e.changedTouches[0].clientX - touchStartX.current;
		const threshold = 30;
		if (dx > threshold) prev();
		else if (dx < -threshold) next();
		touchStartX.current = null;
	};

	if (!images || images.length === 0) {
		return <div style={{ width: '100%', height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No images</div>;
	}

	const current = images[index];
	const src = `/api/image/${productId}?index=${current.sortOrder}`;

	return (
		<div style={{ width: '100%', maxWidth: 900, margin: '0 auto' }}>
			<div
				onTouchStart={onTouchStart}
				onTouchEnd={onTouchEnd}
				style={{ position: 'relative', width: '100%', height: 500, background: '#eee', borderRadius: 8, overflow: 'hidden' }}
			>
				<Image src={src} alt={`Image ${index + 1}`} fill style={{ objectFit: 'contain' }} />
				<button onClick={prev} aria-label="Previous" style={navBtnStyle('left')}>‹</button>
				<button onClick={next} aria-label="Next" style={navBtnStyle('right')}>›</button>
			</div>

			<div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 8 }}>
				{images.map((img, i) => (
					<button
						key={img.id}
						onClick={() => setIndex(i)}
						style={{
							width: 12,
							height: 12,
							borderRadius: 6,
							border: 'none',
							background: i === index ? '#000' : '#ddd',
							padding: 0
						}}
						aria-label={`Go to image ${i + 1}`}
					/>
				))}
			</div>
		</div>
	);
}

function navBtnStyle(pos: 'left' | 'right'): React.CSSProperties {
	return {
		position: 'absolute',
		top: '50%',
		transform: 'translateY(-50%)',
		[pos]: 8,
		width: 36,
		height: 36,
		borderRadius: 18,
		background: 'rgba(255,255,255,0.8)',
		border: '1px solid rgba(0,0,0,0.1)',
		fontSize: 20,
		lineHeight: '36px',
		textAlign: 'center',
		cursor: 'pointer'
	};
}
