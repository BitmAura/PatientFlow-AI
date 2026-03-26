import { WhatsAppProvider } from './provider-interface';
import { GupshupProvider } from './providers/gupshup-provider';

export type ProviderType = 'gupshup' | 'meta' | 'twilio';

export class WhatsAppProviderFactory {
  private static providers: Map<ProviderType, WhatsAppProvider> = new Map();

  static getProvider(type: ProviderType): WhatsAppProvider {
    if (!this.providers.has(type)) {
      switch (type) {
        case 'gupshup':
          this.providers.set(type, new GupshupProvider());
          break;
        // case 'meta':
        //   this.providers.set(type, new MetaProvider());
        //   break;
        default:
          throw new Error(`Provider ${type} not supported`);
      }
    }
    return this.providers.get(type)!;
  }
}
