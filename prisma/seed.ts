import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const gift = await prisma.tag.upsert({ where: { name: "gift" }, create: { name: "gift" }, update: {} });
  const fresh = await prisma.tag.upsert({ where: { name: "new" }, create: { name: "new" }, update: {} });

  const p1 = await prisma.product.upsert({
    where: { slug: "starry-music-box" },
    create: {
      slug: "starry-music-box",
      name: "Starry Music Box",
      short: "梦幻星空八音盒，送礼首选。",
      description: "高级机芯、温暖旋律，手工打磨边角，安全环保材料。",
      currency: "CAD",
      inStock: true,
      images: {
        create: [
          { url: "/products/starry-music-box.jpg", sortOrder: 0 },
          { url: "/products/starry-music-box-2.jpg", sortOrder: 1 }
        ]
      },
      prices: { create: { amountCents: 2999, active: true } },
      tags: { create: [{ tagId: gift.id }, { tagId: fresh.id }] }
    },
    update: {}
  });

  const p2 = await prisma.product.upsert({
    where: { slug: "magic-snow-globe" },
    create: {
      slug: "magic-snow-globe",
      name: "Magic Snow Globe",
      short: "轻摇即亮，洒满金粉与星光。",
      description: "电池供电，夜灯模式；透明玻璃球体，稳定底座。",
      currency: "CAD",
      inStock: false,
      images: { create: [{ url: "/products/magic-snow-globe.jpg", sortOrder: 0 }] },
      prices: { create: { amountCents: 2450, active: true } },
      tags: { create: [{ tagId: gift.id }] }
    },
    update: {}
  });

  console.log("Seeded:", p1.slug, p2.slug);
}

main().finally(() => prisma.$disconnect());
