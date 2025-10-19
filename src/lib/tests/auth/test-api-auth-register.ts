const API_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

async function testRegisterNewUser() {
  console.log('🧪 Test: POST /api/auth/register (registro exitoso)\n')

  try {
    const timestamp = Date.now()
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Datos del usuario
        email: `test${timestamp}@nuevaempresa.cl`,
        password: 'Password123!',
        confirmPassword: 'Password123!',
        firstName: 'Juan',
        lastName: 'Pérez',
        
        // Datos de la empresa
        companyName: `Nueva Empresa ${timestamp}`,
        companyRut: `${Math.floor(10000000 + Math.random() * 90000000)}-${Math.floor(Math.random() * 10)}`,
        companyPhone: '+56912345678',
        companyAddress: 'Av. Providencia 123, Santiago',
      }),
    })

    const data = await response.json()
    
    console.log('Status:', response.status)
    console.log('Response:', JSON.stringify(data, null, 2))
    console.log('')

    if (data.success && response.status === 201) {
      console.log('✅ Test pasado: Usuario y empresa creados exitosamente')
      console.log(`   Usuario ID: ${data.data.user.id}`)
      console.log(`   Email: ${data.data.user.email}`)
      console.log(`   Rol: ${data.data.user.role}`)
      console.log(`   Empresa: ${data.data.company.name}`)
      console.log(`   RUT: ${data.data.company.rut}`)
    } else {
      console.log('❌ Test fallido:', data.error)
    }
  } catch (error) {
    console.error('❌ Error en el test:', error)
  }
}

async function testRegisterWithExistingEmail() {
  console.log('\n🧪 Test: POST /api/auth/register (email duplicado)\n')

  try {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@empresademo.cl', // Email que ya existe del seed
        password: 'Password123!',
        confirmPassword: 'Password123!',
        firstName: 'Test',
        lastName: 'Duplicado',
        companyName: 'Empresa Test',
        companyRut: '99888777-6',
      }),
    })

    const data = await response.json()
    
    console.log('Status:', response.status)
    console.log('Response:', JSON.stringify(data, null, 2))
    console.log('')

    if (!data.success) {
      console.log('✅ Test pasado: Email duplicado correctamente rechazado')
    } else {
      console.log('❌ Test fallido: Debería rechazar email duplicado')
    }
  } catch (error) {
    console.error('❌ Error en el test:', error)
  }
}

async function testRegisterWithExistingRut() {
  console.log('\n🧪 Test: POST /api/auth/register (RUT duplicado)\n')

  try {
    const timestamp = Date.now()
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: `test${timestamp}@test.cl`,
        password: 'Password123!',
        confirmPassword: 'Password123!',
        firstName: 'Test',
        lastName: 'RUT Duplicado',
        companyName: 'Empresa Test',
        companyRut: '12345678-9', // RUT que ya existe del seed
      }),
    })

    const data = await response.json()
    
    console.log('Status:', response.status)
    console.log('Response:', JSON.stringify(data, null, 2))
    console.log('')

    if (!data.success) {
      console.log('✅ Test pasado: RUT duplicado correctamente rechazado')
    } else {
      console.log('❌ Test fallido: Debería rechazar RUT duplicado')
    }
  } catch (error) {
    console.error('❌ Error en el test:', error)
  }
}

async function testRegisterWithWeakPassword() {
  console.log('\n🧪 Test: POST /api/auth/register (contraseña débil)\n')

  try {
    const timestamp = Date.now()
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: `test${timestamp}@test.cl`,
        password: 'weak', // Contraseña débil
        confirmPassword: 'weak',
        firstName: 'Test',
        lastName: 'Password',
        companyName: 'Empresa Test',
        companyRut: `${Math.floor(10000000 + Math.random() * 90000000)}-5`,
      }),
    })

    const data = await response.json()
    
    console.log('Status:', response.status)
    console.log('Response:', JSON.stringify(data, null, 2))
    console.log('')

    if (!data.success) {
      console.log('✅ Test pasado: Contraseña débil correctamente rechazada')
    } else {
      console.log('❌ Test fallido: Debería rechazar contraseña débil')
    }
  } catch (error) {
    console.error('❌ Error en el test:', error)
  }
}

async function testRegisterWithPasswordMismatch() {
  console.log('\n🧪 Test: POST /api/auth/register (contraseñas no coinciden)\n')

  try {
    const timestamp = Date.now()
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: `test${timestamp}@test.cl`,
        password: 'Password123!',
        confirmPassword: 'DifferentPassword123!', // No coincide
        firstName: 'Test',
        lastName: 'Mismatch',
        companyName: 'Empresa Test',
        companyRut: `${Math.floor(10000000 + Math.random() * 90000000)}-5`,
      }),
    })

    const data = await response.json()
    
    console.log('Status:', response.status)
    console.log('Response:', JSON.stringify(data, null, 2))
    console.log('')

    if (!data.success) {
      console.log('✅ Test pasado: Contraseñas no coincidentes correctamente rechazadas')
    } else {
      console.log('❌ Test fallido: Debería rechazar contraseñas no coincidentes')
    }
  } catch (error) {
    console.error('❌ Error en el test:', error)
  }
}

async function runAllTests() {
  console.log('🚀 Ejecutando suite de tests para POST /api/auth/register\n')
  console.log('=' .repeat(60))
  
  await testRegisterNewUser()
  await testRegisterWithExistingEmail()
  await testRegisterWithExistingRut()
  await testRegisterWithWeakPassword()
  await testRegisterWithPasswordMismatch()
  
  console.log('=' .repeat(60))
  console.log('\n✅ Suite de tests completada\n')
}

runAllTests()