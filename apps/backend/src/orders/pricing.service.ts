import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface PricingConfig {
  ebookPrice: number;
  physicalPrice: number;
  shippingPrice: number;
}

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
      this.savePricing({
        ebookPrice: 499,
        physicalPrice: 1299,
        shippingPrice: 99,
      });
    }
  }

  getPricing(): PricingConfig {
    const data = fs.readFileSync(this.configPath, 'utf-8');
    return JSON.parse(data);
  }

  savePricing(config: PricingConfig) {
    fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2));
    return config;
  }
}
