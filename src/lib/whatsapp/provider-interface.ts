export interface WhatsAppProviderConfig {
  apiKey: string;
  appId?: string; // Specific to some providers like Gupshup
  phoneNumberId?: string;
  webhookUrl?: string;
  [key: string]: any; // Allow flexible config
}

export interface SendMessageOptions {
  type: 'text' | 'template' | 'image' | 'document';
  content: string | any; // Text body or template object
  metadata?: any;
}

export interface SendMessageResult {
  success: boolean;
  messageId?: string;
  error?: string;
  rawResponse?: any;
}

export interface IncomingMessage {
  from: string;
  type: string;
  content: any;
  messageId: string;
  timestamp: string;
  metadata?: any;
}

export interface RegistrationResult {
  success: boolean;
  numberId?: string;
  status: string;
  providerData?: any;
}

export interface WhatsAppProvider {
  /**
   * Registers a phone number with the BSP.
   * This might involve setting webhooks, verifying OTPs, etc.
   */
  registerNumber(phone: string, config: WhatsAppProviderConfig): Promise<RegistrationResult>;

  /**
   * Deregisters a phone number, removing it from the BSP account.
   */
  deregisterNumber(phone: string, config: WhatsAppProviderConfig): Promise<void>;

  /**
   * Sends a message to a destination phone number.
   */
  sendMessage(to: string, options: SendMessageOptions, config: WhatsAppProviderConfig): Promise<SendMessageResult>;

  /**
   * Parses an incoming webhook payload into a standardized message format.
   */
  receiveMessage(payload: any): Promise<IncomingMessage[]>;

  /**
   * Temporarily pauses a number (if supported by BSP), e.g., stopping automation.
   * This might be a logical pause on our side or a BSP-side feature.
   */
  pauseNumber(phone: string, config: WhatsAppProviderConfig): Promise<void>;
  
  /**
   * Validates the configuration for this provider.
   */
  validateConfig(config: WhatsAppProviderConfig): boolean;

  /**
   * Verifies the OTP for the phone number.
   */
  verifyOtp(phone: string, otp: string, config: WhatsAppProviderConfig): Promise<RegistrationResult>;
}
