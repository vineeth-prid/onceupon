import { Controller, Get, Put, Delete, UseGuards, Req, Param, Body, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminService } from './admin.service';
import { UserRole } from '@prisma/client';

@Controller('admin')
@UseGuards(AuthGuard('jwt'))
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  private checkAdmin(req: any) {
    if (req.user?.role !== UserRole.ADMIN) {
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
}
