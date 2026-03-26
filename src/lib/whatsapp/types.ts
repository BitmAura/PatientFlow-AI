import { CONNECTION_STATUS } from '@/constants/whatsapp'

export interface WhatsAppSession {
  status: CONNECTION_STATUS
  qrCode?: string
}

export interface WhatsAppService {
  sendMessage(phone: string, message: string): Promise<{ success: boolean; messageId?: string }>
  getStatus(): Promise<{ connected: boolean; qrCode?: string }>
  disconnect(): Promise<void>
}

export interface WhatsAppTemplateComponent {
  type: 'body' | 'header' | 'button'
  parameters: Array<{
    type: 'text' | 'image' | 'video' | 'currency' | 'date_time'
    text?: string
    image?: { link: string }
    video?: { link: string }
  }>
}

export interface WhatsAppTemplate {
  name: string
  language: { code: string }
  components?: WhatsAppTemplateComponent[]
}