async function testRegistration() {
  const testData = {
    name: "Test Farmer",
    farmLocation: "Test Location",
    produceType: "almonds",
    quantity: "1000",
    price: "25.50",
    email: "testfarmer@example.com",
    phone: "+212656271147",
    additionalInfo: "Test registration"
  }

  try {
    const response = await fetch('http://localhost:3000/api/farmers/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData),
    })

    const data = await response.json()
    console.log('Response status:', response.status)
    console.log('Response data:', data)
  } catch (error) {
    console.error('Error:', error)
  }
}

testRegistration()
