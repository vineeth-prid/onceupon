import { api } from './client';
import type { CreateOrderInput } from '@bookmagic/shared';

export async function uploadPhoto(file: File): Promise<{ url: string }> {
  const form = new FormData();
  form.append('file', file);
  const { data } = await api.post('/upload/photo', form);
  return data;
}

export async function createOrder(input: CreateOrderInput) {
  const { data } = await api.post('/orders', input);
  return data;
}

export async function getAllOrders() {
  const { data } = await api.get('/orders');
  return data;
}

export async function getAdminOrders() {
  const { data } = await api.get('/orders/admin/all');
  return data;
}

export async function getAdminDashboardStats() {
  const { data } = await api.get('/orders/admin/dashboard/stats');
  return data;
}

export async function getAdminUsers() {
  const { data } = await api.get('/orders/admin/users');
  return data;
}

export async function getAdminBooks() {
  const { data } = await api.get('/orders/admin/books');
  return data;
}

export async function getAdminPayments() {
  const { data } = await api.get('/orders/admin/payments');
  return data;
}

export async function getOrder(id: string) {
  const { data } = await api.get(`/orders/${id}`);
  return data;
}

export async function completeOrder(id: string) {
  const { data } = await api.post(`/orders/${id}/complete`);
  return data;
}

export async function downloadPdf(id: string): Promise<Blob> {
  const { data } = await api.get(`/orders/${id}/pdf`, { responseType: 'blob' });
  return data;
}

export async function createRazorpayOrder(id: string, amount?: number, shipping?: any, couponCode?: string) {
  const { data } = await api.post(`/orders/${id}/razorpay`, { amount, shipping, couponCode });
  return data;
}

export async function validateCoupon(code: string, amount: number) {
  const { data } = await api.post('/coupons/validate', { code, amount });
  return data;
}

export async function verifyRazorpayPayment(payload: {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) {
  const { data } = await api.post('/orders/razorpay/verify', payload);
  return data;
}

export interface PricingConfig {
  ebookPrice: number;
  physicalPrice: number;
  shippingPrice: number;
}

export async function getPricing(): Promise<PricingConfig> {
  const { data } = await api.get('/pricing');
  return data;
}

export async function savePricing(config: PricingConfig): Promise<PricingConfig> {
  const { data } = await api.put('/pricing', config);
  return data;
}

