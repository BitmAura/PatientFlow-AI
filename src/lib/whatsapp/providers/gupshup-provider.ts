import { 
  WhatsAppProvider, 
  WhatsAppProviderConfig, 
  SendMessageOptions, 
  SendMessageResult, 
  RegistrationResult, 
  IncomingMessage 
} from '../provider-interface';

export class GupshupProvider implements WhatsAppProvider {
  private readonly baseUrl = 'https://api.gupshup.io/wa/api/v1';

  async registerNumber(phone: string, config: WhatsAppProviderConfig): Promise<RegistrationResult> {
    try {
      // 1. Verify API Key
      if (!this.validateConfig(config)) {
        throw new Error('Invalid Gupshup configuration');
      }

      // 2. Call Gupshup API to initiate registration & Trigger OTP
      // Endpoint: https://partner.gupshup.io/partner/app/{appId}/register
      const endpoint = `https://partner.gupshup.io/partner/app/${config.appId}/register`;
      const params = new URLSearchParams();
      params.append('phone', phone);
      params.append('verify_method', 'otp'); // or 'voice'
      params.append('apikey', config.apiKey);

      console.log(`[Gupshup] Initiating registration for ${phone} on App ${config.appId}`);
      
      // Mocking the fetch call
      // const response = await fetch(endpoint, { method: 'POST', body: params });
      // const data = await response.json();
      
      // if (!response.ok) throw new Error(data.message || 'Gupshup registration failed');

      // 3. Return Pending Verification status
      return {
        success: true,
        status: 'pending_verification', // Will be mapped to 'connecting' in DB
        providerData: { 
          appId: config.appId,
          otpSent: true,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error: any) {
      console.error('[Gupshup] Registration Error:', error);
      return {
        success: false,
        status: 'failed',
        providerData: { error: error.message }
      };
    }
  }

  async verifyOtp(phone: string, otp: string, config: WhatsAppProviderConfig): Promise<RegistrationResult> {
    try {
      // Endpoint: https://partner.gupshup.io/partner/app/{appId}/verify
      const endpoint = `https://partner.gupshup.io/partner/app/${config.appId}/verify`;
      const params = new URLSearchParams();
      params.append('phone', phone);
      params.append('otp', otp);
      params.append('apikey', config.apiKey);

      console.log(`[Gupshup] Verifying OTP for ${phone}`);

      // Mock Fetch
      // const response = await fetch(endpoint, { method: 'POST', body: params });
      // const data = await response.json();
      
      // if (!response.ok) throw new Error(data.message || 'OTP verification failed');

      // Success
      return {
        success: true,
        status: 'connected',
        numberId: `ph_${phone}`, // Gupshup doesn't always give a unique ID, phone is key
        providerData: { 
          appId: config.appId,
          verifiedAt: new Date().toISOString()
        }
      };
    } catch (error: any) {
      console.error('[Gupshup] OTP Verification Error:', error);
      return {
        success: false,
        status: 'failed',
        providerData: { error: error.message }
      };
    }
  }

  async deregisterNumber(phone: string, config: WhatsAppProviderConfig): Promise<void> {
    console.log(`[Gupshup] Deregistering number ${phone}`);
    // Call Gupshup API to remove number or disable app
    // await fetch(...)
  }

  async sendMessage(to: string, options: SendMessageOptions, config: WhatsAppProviderConfig): Promise<SendMessageResult> {
    try {
      const endpoint = `${this.baseUrl}/msg`
      const params = new URLSearchParams()
      params.append('channel', 'whatsapp')
      params.append('source', config.phoneNumberId || '')
      params.append('destination', to.replace(/\D/g, ''))
      params.append('src.name', config.appName || 'AuraRecall')
      params.append('apikey', config.apiKey)

      if (options.type === 'text') {
        params.append('message', JSON.stringify({ type: 'text', text: options.content, previewUrl: false }))
      } else if (options.type === 'template') {
        params.append('template', JSON.stringify(options.content))
      } else {
        return { success: false, error: 'Unsupported message type', rawResponse: null }
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        const errMsg = (data as any)?.message || data?.status || response.statusText
        throw new Error(errMsg)
      }
      const messageId = (data as any)?.messageId || `gs_${Date.now()}`
      return { success: true, messageId }
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || 'Gupshup send failed',
        rawResponse: error,
      }
    }
  }

  async receiveMessage(payload: any): Promise<IncomingMessage[]> {
    const messages: IncomingMessage[] = [];

    // Case 1: Standard Gupshup Payload (type = 'message')
    if (payload.type === 'message') {
      const body = payload.payload;
      messages.push({
        from: body.sender.phone,
        type: body.type,
        content: body.body.text || body.body, // Text is often in body.text for text type
        messageId: body.id,
        timestamp: new Date(payload.timestamp).toISOString(),
        metadata: payload
      });
    }
    
    // Case 2: Meta/Cloud API Format (v3) - Gupshup often proxies this format too
    // Check if payload has 'entry' array (Standard Meta Webhook structure)
    else if (payload.object === 'whatsapp_business_account' && payload.entry) {
      for (const entry of payload.entry) {
        for (const change of entry.changes) {
          if (change.value && change.value.messages) {
            for (const msg of change.value.messages) {
              messages.push({
                from: msg.from,
                type: msg.type,
                content: msg.text?.body || '', // Extract text body safely
                messageId: msg.id,
                timestamp: new Date(Number(msg.timestamp) * 1000).toISOString(),
                metadata: msg
              });
            }
          }
        }
      }
    }

    return messages;
  }

  async pauseNumber(phone: string, config: WhatsAppProviderConfig): Promise<void> {
    // Gupshup doesn't have a direct "pause" API usually, 
    // so we might just log it or rely on the core system to stop calling sendMessage.
    console.log(`[Gupshup] Pausing number ${phone} (Logical Pause)`);
  }

  validateConfig(config: WhatsAppProviderConfig): boolean {
    return !!(config.apiKey && config.appId);
  }
}
