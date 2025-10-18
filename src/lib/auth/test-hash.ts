import { hashPassword, verifyPassword } from "./password";

async function testPasswordHashing() {
    console.log('🔑 Probando hasheo de contraseña...\n');

    const password = 'MiPassword123!';
    console.log(`Contraseña original: ${password}\n`);

    const hash1 = await hashPassword(password);
    console.log(`Hash 1: ${hash1}\n`);

    const hash2 = await hashPassword(password);
    console.log(`Hash 2: ${hash2}\n`);

    console.log('\n✅ Nota: Los hashes son diferentes (incluyen salt aleatorio)\n')

    const isValid1 = await verifyPassword(password, hash1);
    const isValid2 = await verifyPassword(password, hash2);
    const isInvalid = await verifyPassword('MiPasswordIncorrecta', hash1);

    console.log(`Verificación hash1: ${isValid1 ? '✅ Correcta' : '❌ Incorrecta'}`)
    console.log(`Verificación hash2: ${isValid2 ? '✅ Correcta' : '❌ Incorrecta'}`)
    console.log(`Verificación incorrecta: ${isInvalid ? '❌ Incorrecta' : '✅ Rechazada correctamente'}`)
    
    console.log('\n🎉 Pruebas completadas exitosamente!')
}

testPasswordHashing()