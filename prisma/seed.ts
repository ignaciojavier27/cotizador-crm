import { prisma } from "@/lib/prisma";

async function main() {
  console.log("🌱 Plantando semillas en la base de datos...\n");

  const company = await prisma.company.upsert({
    where: { rut: "111111111-1" },
    update: {},
    create: {
      name: "Mi Empresa",
      rut: "111111111-1",
      logoUrl:
        "https://dmxg5wxfqgb4u.cloudfront.net/styles/athlete_profile_listing_medium_1x/s3/2025-06/TOPURIA_ILIA_BELT_10-26.png?itok=rSOn_juG",
      address: "Calle 01",
      phone: "+56912345678",
      contactEmail: "contacto@miempresa.cl",
    },
  });

  console.log(`✅ Empresa creada o encontrada: ${company.name}\n`);
}

main()
  .then(() => console.log("🎉 Semillas completadas con éxito"))
  .catch((e) => {
    console.error("❌ Error al ejecutar las semillas:\n", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log("🔌 Conexión cerrada");
  });
