import Link from "next/link";
import Image from "next/image";
import Price from "./Price";

type Item = {
  slug: string; name: string; short: string;
  priceCents: number | null; currency: string; images: string[];
};

export default function ProductCard({ p }: { p: Item }) {
  return (
    <Link href={`/products/${p.slug}`} className="group card hover:shadow-md transition block overflow-hidden">
      <div className="aspect-square relative">
        <Image src={p.images[0]} alt={p.name} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover" />
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">{p.name}</h3>
          <Price cents={p.priceCents} currency={p.currency} />
        </div>
        <p className="mt-1 text-sm" style={{color:"#555"}}>{p.short}</p>
      </div>
    </Link>
  );
}
