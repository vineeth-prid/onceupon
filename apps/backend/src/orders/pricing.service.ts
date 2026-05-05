import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { PricingConfig, DEFAULT_PRICING } from '@bookmagic/shared';

export type { PricingConfig };

@Injectable()
export class PricingService {
  private readonly configPath = path.join(process.cwd(), 'data', 'pricing.json');

  constructor() {
    this.ensureConfigExists();
  }

  private ensureConfigExists() {
    const dataDir = path.dirname(this.configPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(this.configPath)) {
      this.writeFile(DEFAULT_PRICING);
    }
  }

  getPricing(): PricingConfig {
    const raw = fs.readFileSync(this.configPath, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<PricingConfig>;
    return this.withDefaults(parsed);
  }

  savePricing(config: Partial<PricingConfig>): PricingConfig {
    const merged = this.withDefaults({ ...this.getPricing(), ...config });
    this.writeFile(merged);
    return merged;
  }

  private withDefaults(input: Partial<PricingConfig>): PricingConfig {
    return {
      premadeStartingPrice: this.num(input.premadeStartingPrice, DEFAULT_PRICING.premadeStartingPrice),
      customStartingPrice: this.num(input.customStartingPrice, DEFAULT_PRICING.customStartingPrice),
      ebookPrice: this.num(input.ebookPrice, DEFAULT_PRICING.ebookPrice),
      physicalPrice: this.num(input.physicalPrice, DEFAULT_PRICING.physicalPrice),
      shippingPrice: this.num(input.shippingPrice, DEFAULT_PRICING.shippingPrice),
    };
  }

  private num(value: unknown, fallback: number): number {
    const n = Number(value);
    return Number.isFinite(n) && n >= 0 ? n : fallback;
  }

  private writeFile(config: PricingConfig) {
    fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2));
  }
}
