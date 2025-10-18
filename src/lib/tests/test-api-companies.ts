async function testCreateCompany() {
  try {
    const response = await fetch('http://localhost:3000/api/companies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Empresa Test API',
        rut: '76555666-7',
        address: 'Calle Test 456',
        phone: '+56987654321',
        contactEmail: 'test@empresatest.cl',
        logoUrl: 'https://example.com/logo.png',
      }),
    })

    const data = await response.json()
    
    console.log('Status:', response.status)
    console.log('Response:', JSON.stringify(data, null, 2))

    if (data.success) {
      console.log('✅ Empresa creada exitosamente')
    } else {
      console.log('❌ Error:', data.error)
    }
  } catch (error) {
    console.error('❌ Error en la petición:', error)
  }
}

testCreateCompany()