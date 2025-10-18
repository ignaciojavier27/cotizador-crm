import { prisma } from "../prisma";

async function testConnection() {
    try {
        console.log('🔄 Probando conexión con la base de datos...\n')

        // Test 1: Conexión a la base de datos
        await prisma.$connect()
        console.log('✅ Conexión a la base de datos exitosa\n')

        // Test 2: Contar tablas
        const companyCount = await prisma.company.count()
        const userCount = await prisma.user.count()
        const categoryCount = await prisma.category.count()
        const productCount = await prisma.product.count()
        const clientCount = await prisma.client.count()
        const quotationCount = await prisma.quotation.count()
        const quotationDetailCount = await prisma.quotationDetail.count()
        const quotationHistory = await prisma.quotationHistory.count()
        const automationCount = await prisma.automation.count()
        const notificationSentCount = await prisma.notificationSent.count()

        console.log(`📊 Companies: ${companyCount}`)
        console.log(`📊 Users: ${userCount}`)
        console.log(`📊 Categories: ${categoryCount}`)
        console.log(`📊 Products: ${productCount}`)
        console.log(`📊 Clients: ${clientCount}`)
        console.log(`📊 Quotations: ${quotationCount}`)
        console.log(`📊 Quotation Details: ${quotationDetailCount}`)
        console.log(`📊 Quotation History: ${quotationHistory}`)
        console.log(`📊 Automations: ${automationCount}`)
        console.log(`📊 Notification Sent: ${notificationSentCount}`)

        console.log('✅ Todas las tablas son accesibles\n')

        // Test 3: Información de la base de datos
        const dbInfo = await prisma.$queryRaw<Array<{
            database: string,
            charset: string,
            collation: string
        }>>`
            SELECT 
                SCHEMA_NAME as db_name,
                DEFAULT_CHARACTER_SET_NAME as charset,
                DEFAULT_COLLATION_NAME as collation
            FROM information_schema.SCHEMATA 
            WHERE SCHEMA_NAME = DATABASE()
        `

        console.log('🗄️  Información de la base de datos:')
        console.log(`   Nombre: ${dbInfo[0].db_name}`)
        console.log(`   Character Set: ${dbInfo[0].charset}`)
        console.log(`   Collation: ${dbInfo[0].collation}\n`)

        if (dbInfo[0].charset !== 'utf8mb4' || dbInfo[0].collation !== 'utf8mb4_unicode_ci') {
        console.warn('⚠️  ADVERTENCIA: Character set o collation no coinciden con lo recomendado')
        console.warn('   Recomendado: utf8mb4 / utf8mb4_unicode_ci\n')
        } else {
        console.log('✅ Character set y collation correctos\n')
        }

        console.log('🎉 ¡Todas las pruebas pasaron exitosamente!\n')

    } catch (error) {
        console.error('❌ Error al conectar con la base de datos:', error)
        process.exit(1)
    } finally {
        await prisma.$disconnect()
        console.log('🔌 Conexión cerrada')
    }
}

testConnection()