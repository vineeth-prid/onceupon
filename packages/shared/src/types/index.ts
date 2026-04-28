import type { CreateOrderInput, StoryOutputInput, ShippingAddressInput } from '../validation/index.js';

export enum OrderStatus {
  CREATED = 'CREATED',
  STORY_GENERATING = 'STORY_GENERATING',
  STORY_COMPLETE = 'STORY_COMPLETE',
  IMAGES_GENERATING = 'IMAGES_GENERATING',
  IMAGES_COMPLETE = 'IMAGES_COMPLETE',
  PDF_GENERATING = 'PDF_GENERATING',
  PREVIEW_READY = 'PREVIEW_READY',
  PAYMENT_PENDING = 'PAYMENT_PENDING',
  PAID = 'PAID',
  ORDER_CONFIRMED = 'ORDER_CONFIRMED',
  PRINTING = 'PRINTING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
}

export enum PageStatus {
  PENDING = 'PENDING',
  GENERATING = 'GENERATING',
  COMPLETE = 'COMPLETE',
  FAILED = 'FAILED',
}

/** Derived from Zod schema to prevent drift */
export type CreateOrderDto = CreateOrderInput;

/** Derived from Zod schema to prevent drift */
export type StoryOutput = StoryOutputInput;

/** Derived from Zod schema to prevent drift */
export type ShippingAddress = ShippingAddressInput;

export interface StoryPage {
  pageNumber: number;
  text: string;
  imagePrompt: string;
  sceneDescription: string;
}

export interface OrderDto {
  id: string;
  childName: string;
  childAge: number;
  childGender: 'boy' | 'girl' | 'other';
  theme: string;
  illustrationStyle: string;
  photoUrl: string;
  status: OrderStatus;
  storyJson: StoryOutput | null;
  referenceSheetUrl: string | null;
  interiorPdfUrl: string | null;
  coverPdfUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PageDto {
  id: string;
  orderId: string;
  pageNumber: number;
  text: string;
  imagePrompt: string;
  imageUrl: string | null;
  status: PageStatus;
}

export interface ProgressEvent {
  orderId: string;
  status: OrderStatus;
  completedPages: number;
  totalPages: number;
  currentStep: string;
}

export interface PaymentSessionDto {
  orderId: string;
  amount: number;
  currency: string;
  sessionId: string;
  provider: 'razorpay';
}
