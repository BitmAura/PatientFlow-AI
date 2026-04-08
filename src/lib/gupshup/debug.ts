/**
 * Gupshup Debug & Testing Utilities
 * 
 * Use these functions to test Gupshup integration in development
 */

import { sendGupshupMessage, getGupshupStatus, registerPhoneWithGupshup, verifyPhoneOtpGupshup } from './service'

export interface TestResult {
  name: string
  status: 'pass' | 'fail' | 'skip'
  duration: number
  message: string
  error?: string
}

/**
 * Test Gupshup API credentials validity
 */
export async function testGupshupCredentials(apiKey: string, appId: string, phoneNumberId: string): Promise<TestResult> {
  const startTime = Date.now()
  
  try {
    const status = await getGupshupStatus(apiKey)
    
    return {
      name: 'API Credentials',
      status: status.healthy ? 'pass' : 'fail',
      duration: Date.now() - startTime,
      message: status.message,
      error: !status.healthy ? status.message : undefined,
    }
  } catch (error) {
    return {
      name: 'API Credentials',
      status: 'fail',
      duration: Date.now() - startTime,
      message: 'Failed to validate credentials',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Test message sending
 */
export async function testMessageSending(
  phoneNumberId: string,
  apiKey: string,
  testPhoneNumber: string
): Promise<TestResult> {
  const startTime = Date.now()
  
  try {
    const result = await sendGupshupMessage({
      clinicId: 'test',
      phoneNumberId,
      apiKey,
      destination: testPhoneNumber,
      messageText: '🧪 Test message from PatientFlow AI - Gupshup integration working!',
    })
    
    return {
      name: 'Message Sending',
      status: result.success ? 'pass' : 'fail',
      duration: Date.now() - startTime,
      message: result.success 
        ? `Message sent (ID: ${result.messageId})`
        : `Failed: ${result.error}`,
      error: !result.success ? result.error : undefined,
    }
  } catch (error) {
    return {
      name: 'Message Sending',
      status: 'fail',
      duration: Date.now() - startTime,
      message: 'Message sending failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Test phone registration flow
 */
export async function testPhoneRegistration(
  phoneNumber: string,
  appId: string,
  apiKey: string
): Promise<TestResult> {
  const startTime = Date.now()
  
  try {
    const result = await registerPhoneWithGupshup({
      clinicId: 'test',
      phoneNumber,
      appId,
      apiKey,
    })
    
    return {
      name: 'Phone Registration',
      status: result.success ? 'pass' : 'fail',
      duration: Date.now() - startTime,
      message: result.success
        ? `Registration initiated (Request ID: ${result.requestId})`
        : `Failed: ${result.error}`,
      error: !result.success ? result.error : undefined,
    }
  } catch (error) {
    return {
      name: 'Phone Registration',
      status: 'fail',
      duration: Date.now() - startTime,
      message: 'Phone registration failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Run full integration test suite
 */
export async function runGupshupTestSuite(
  apiKey: string,
  appId: string,
  phoneNumberId: string,
  testPhoneNumber?: string
): Promise<TestResult[]> {
  console.log('[Gupshup Test] Starting integration test suite...')
  
  const results: TestResult[] = []
  
  // Test 1: Credentials
  console.log('[Test 1/3] Testing API credentials...')
  results.push(await testGupshupCredentials(apiKey, appId, phoneNumberId))
  
  // Test 2: Message Sending
  if (testPhoneNumber) {
    console.log('[Test 2/3] Testing message sending...')
    results.push(await testMessageSending(phoneNumberId, apiKey, testPhoneNumber))
  } else {
    results.push({
      name: 'Message Sending',
      status: 'skip',
      duration: 0,
      message: 'Skipped (no test phone number provided)',
    })
  }
  
  // Test 3: Phone Registration
  console.log('[Test 3/3] Testing phone registration...')
  results.push(await testPhoneRegistration(phoneNumberId, appId, apiKey))
  
  console.log('[Gupshup Test] Test suite completed')
  return results
}

/**
 * Format test results for display
 */
export function formatTestResults(results: TestResult[]): string {
  let output = '\n📋 Gupshup Integration Tests\n'
  output += '═'.repeat(40) + '\n\n'
  
  for (const result of results) {
    const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⏭️ '
    const status = result.status.toUpperCase().padEnd(6)
    
    output += `${icon} ${status} ${result.name} (${result.duration}ms)\n`
    output += `   ${result.message}\n`
    
    if (result.error) {
      output += `   Error: ${result.error}\n`
    }
    output += '\n'
  }
  
  const passed = results.filter(r => r.status === 'pass').length
  const failed = results.filter(r => r.status === 'fail').length
  const skipped = results.filter(r => r.status === 'skip').length
  
  output += '═'.repeat(40) + '\n'
  output += `Results: ${passed} passed, ${failed} failed, ${skipped} skipped\n`
  
  return output
}

/**
 * Log detailed Gupshup configuration info (safe for debugging)
 */
export function logGupshupConfig(
  appId: string,
  phoneNumberId: string,
  apiKeyMasked: string
): void {
  console.log('[Gupshup Config]', {
    appId: appId ? '✓ Set' : '✗ Missing',
    phoneNumberId: phoneNumberId ? `✓ Set (${phoneNumberId})` : '✗ Missing',
    apiKey: apiKeyMasked ? `✓ Set (${apiKeyMasked})` : '✗ Missing',
  })
}

/**
 * Mask API key for safe logging
 */
export function maskApiKey(apiKey: string): string {
  if (!apiKey) return ''
  if (apiKey.length <= 4) return apiKey
  return apiKey.substring(0, 4) + '•'.repeat(Math.min(apiKey.length - 8, 4)) + apiKey.substring(apiKey.length - 4)
}