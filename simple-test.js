// Simple test script for the email API
const fetch = require('node-fetch');

async function testEmailAPI() {
  try {
    console.log("Testing the email API endpoint...");
    
    // Try to call the endpoint
    const response = await fetch('http://localhost:3000/api/get-email');
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("API Response:", data);
    console.log("Test completed successfully!");
  } catch (error) {
    console.error("Test failed:", error.message);
  }
}

// Run the test
testEmailAPI(); 