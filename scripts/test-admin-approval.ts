async function testAdminApproval() {
  const registrationId = "cmqj8k2hl000310bjcfcee9d5" // Use the ID from the previous test
  const password = "testPassword123"

  try {
    console.log("Testing admin approval for registration:", registrationId)
    
    const response = await fetch('http://localhost:3000/api/admin/farmer-registrations', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': 'next-auth.session-token=your-admin-session-token' // This would need a real admin session
      },
      body: JSON.stringify({
        registrationId,
        action: 'approve',
        password
      }),
    })

    console.log('Response status:', response.status)
    const data = await response.json()
    console.log('Response data:', data)
  } catch (error) {
    console.error('Test error:', error)
  }
}

testAdminApproval()
