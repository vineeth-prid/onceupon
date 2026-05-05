import { Controller, Get, Put, Patch, Delete, Post, UseGuards, Req, Res, Param, Body, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminService } from './admin.service';
import { UserRole } from '@prisma/client';
import { Response } from 'express';

@Controller('admin')
@UseGuards(AuthGuard('jwt'))
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  private checkAdmin(req: any) {
    if (req.user?.role !== 'ADMIN') {
      throw new ForbiddenException('Admin access only');
    }
  }

  @Get('stats')
  async getStats(@Req() req: any) {
    this.checkAdmin(req);
    return this.adminService.getStats();
  }

  @Get('orders')
  async getOrders(@Req() req: any) {
    this.checkAdmin(req);
    return this.adminService.getAllOrders();
  }

  @Get('users')
  async getUsers(@Req() req: any) {
    this.checkAdmin(req);
    return this.adminService.getAllUsers();
  }

  // ── New from main: individual user management ──

  @Get('users/:id')
  async getUser(@Req() req: any, @Param('id') id: string) {
    this.checkAdmin(req);
    return this.adminService.getUserById(id);
  }

  @Put('users/:id/role')
  async updateUserRole(
    @Req() req: any,
    @Param('id') id: string,
    @Body('role') role: string,
  ) {
    this.checkAdmin(req);
    return this.adminService.updateUserRole(id, role);
  }

  @Delete('users/:id')
  async deleteUser(@Req() req: any, @Param('id') id: string) {
    this.checkAdmin(req);
    return this.adminService.deleteUser(id);
  }

  // ── Preserved from our branch: Quick Action endpoints ──

  @Post('actions/process-pending')
  async processPending(@Req() req: any) {
    this.checkAdmin(req);
    return this.adminService.processPendingOrders();
  }

  @Post('actions/retry-failed')
  async retryFailed(@Req() req: any) {
    this.checkAdmin(req);
    return this.adminService.retryFailedGenerations();
  }

  @Post('actions/send-bulk-notification')
  async sendBulkNotification(@Req() req: any) {
    this.checkAdmin(req);
    return this.adminService.sendBulkNotification();
  }

  @Get('actions/export-report')
  async exportReport(@Req() req: any, @Res() res: Response) {
    this.checkAdmin(req);
    const report = await this.adminService.getMonthlyReport();

    // Build CSV
    const headers = ['Order ID', 'Date', 'Customer', 'Child Name', 'Theme', 'Status', 'Amount (INR)'];
    const rows = report.orders.map((o: any) => [
      o.id,
      new Date(o.createdAt).toLocaleDateString('en-IN'),
      o.user ? `${o.user.firstName} ${o.user.lastName}` : 'Guest',
      o.childName,
      o.theme,
      o.status,
      o.amountPaid ? (o.amountPaid / 100).toString() : '0',
    ]);

    const summary = [
      ['Monthly Report', report.month],
      ['Total Orders', report.totalOrders.toString()],
      ['Paid Orders', report.paidOrders.toString()],
      ['Failed Orders', report.failedOrders.toString()],
      ['Total Revenue (INR)', report.totalRevenue.toString()],
      ['New Users', report.newUsers.toString()],
      ['Books Generated', report.booksGenerated.toString()],
      [],
    ];

    const csvContent = [
      ...summary.map((row) => row.join(',')),
      headers.join(','),
      ...rows.map((row: string[]) =>
        row.map((cell: string) => `"${(cell ?? '').replace(/"/g, '""')}"`).join(','),
      ),
    ].join('\n');

    const filename = `monthly_report_${new Date().toISOString().slice(0, 7)}.csv`;

    res.set({
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': Buffer.byteLength(csvContent),
    });
    res.send(csvContent);
  }

  @Get('actions/report-summary')
  async getReportSummary(@Req() req: any) {
    this.checkAdmin(req);
    return this.adminService.getMonthlyReport();
  }

  @Get('messages')
  async getMessages(@Req() req: any) {
    this.checkAdmin(req);
    return this.adminService.getMessages();
  }

  @Patch('messages/:id/read')
  async markMessageAsRead(@Req() req: any, @Param('id') id: string) {
    this.checkAdmin(req);
    return this.adminService.markMessageAsRead(id);
  }
}
