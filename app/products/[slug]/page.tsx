import Image from "next/image";
import Price from "@/components/Price";
import { getProductBySlug } from "@/lib/products";

type Props = { params: { slug: string } };

export default async function ProductPage({ params }: Props) {
  const p = await getProductBySlug(params.slug);
  if (!p) return <div className="py-20 text-center">Not found</div>;

  return (
    <article className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-4">
        {p.images.map((src) => (
          <div key={src} className="relative aspect-square rounded-2xl overflow-hidden">
            <Image src={src} alt={p.name} fill sizes="(max-width:768px) 100vw, 50vw" className="object-cover" />
          </div>
        ))}
      </div>
      <div>
        <h1 className="text-3xl font-semibold">{p.name}</h1>
        <div className="mt-2 text-xl"><Price cents={p.priceCents} currency={p.currency} /></div>
        <p className="mt-4" style={{color:"#555"}}>{p.description}</p>

        <div className="mt-8 card p-4" style={{background:"#ffffffcc"}}>
          <h2 className="font-medium">How to buy</h2>
          <p className="mt-2 text-sm" style={{color:"#555"}}>
            We currently support <strong>local pickup</strong> only. Scan the Facebook QR code to message us and arrange your order.
          </p>
          <div className="mt-4 flex items-center gap-4">
            <img src="/qrcode-facebook.png" alt="Facebook QR" width={132} height={132} className="rounded-md" />
            <div className="text-sm">
              <p>Or visit: <a className="underline" href="https://facebook.com/magicgiftstudio" target="_blank">facebook.com/magicgiftstudio</a></p>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
