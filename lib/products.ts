import { prisma } from "./db";

export async function getAllVisibleProducts() {
  const rows = await prisma.product.findMany({
    where: { inStock: true },
    orderBy: { createdAt: "desc" },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      prices: { where: { active: true }, orderBy: { createdAt: "desc" }, take: 1 },
      tags: { include: { tag: true } }
    }
  });

  return rows.map(p => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    short: p.short,
    description: p.description,
    currency: p.currency,
    priceCents: p.prices[0]?.amountCents ?? null,
    images: p.images.map(i => i.url),
    tags: p.tags.map(t => t.tag.name),
  }));
}

export async function getProductBySlug(slug: string) {
  const p = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      prices: { where: { active: true }, orderBy: { createdAt: "desc" }, take: 1 }
    }
  });
  if (!p) return null;
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    short: p.short,
    description: p.description,
    currency: p.currency,
    priceCents: p.prices[0]?.amountCents ?? null,
    images: p.images.map(i => i.url),
    inStock: p.inStock
  };
}
