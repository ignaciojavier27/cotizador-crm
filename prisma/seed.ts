import { hashPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";

async function main() {
  console.log("🌱 Plantando semillas en la base de datos...\n");

  const company = await prisma.company.upsert({
    where: { rut: "12345678-9" },
    update: {},
    create: {
      name: "Mi Empresa",
      rut: "12345678-9",
      logoUrl:
        "https://dmxg5wxfqgb4u.cloudfront.net/styles/athlete_profile_listing_medium_1x/s3/2025-06/TOPURIA_ILIA_BELT_10-26.png?itok=rSOn_juG",
      address: "Calle 01",
      phone: "+56912345678",
      contactEmail: "contacto@miempresa.cl",
    },
  });

  console.log(`✅ Empresa creada o encontrada: ${company.name}\n`);

  const adminPassword = await hashPassword('Admin123!')
  const sellerPassword = await hashPassword('Seller123!')

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@empresademo.cl" },
    update: {},
    create: {
      companyId: company.id,
      email: "admin@empresademo.cl",
      passwordHash: adminPassword,
      firstName: "Admin",
      lastName: "Demo",
      role: UserRole.admin,
      isActive: true,
    },
  });

  console.log(`Admin creado o encontrado: ${adminUser.email}\n`);
  console.log('Email:' + adminUser.email);
  console.log(`Password: ${adminPassword}\n`);

  const sellerUser  = await prisma.user.upsert({
    where: { email: "seller@miempresa" },
    update: {},
    create: {
      companyId: company.id,
      email: "seller@miempresa.cl",
      passwordHash: sellerPassword,
      firstName: "Seller",
      lastName: "Demo",
      role: UserRole.seller,
      isActive: true,
    },
  });

  console.log(`Seller creado o encontrado: ${sellerUser.email}\n`);
  console.log('Email: seller@miempresa.cl');
  console.log('Password: Seller123!\n');


  console.log('\n🎉 Seed completado exitosamente!')
  console.log('\n📝 Credenciales de prueba guardadas arriba ⬆️')
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
