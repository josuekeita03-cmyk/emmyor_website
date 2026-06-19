async function testFarmerRegistration() {
  const testData = {
    name: "Test Farmer",
    farmLocation: "Test Location",
    produceType: "almonds",
    quantity: "1000",
    price: "25.50",
    email: "testfarmer123@example.com",
    phone: "+212656271147",
    additionalInfo: "Test registration"
  }

  try {
    console.log("Testing farmer registration with data:", testData)
    const response = await fetch('http://localhost:3000/api/farmers/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData),
    })

    console.log('Response status:', response.status)
    const data = await response.json()
    console.log('Response data:', data)
  } catch (error) {
    console.error('Test error:', error)
  }
}

testFarmerRegistration()
