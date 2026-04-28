import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('addresses')
  async getAddresses(@Req() req: any) {
    return this.usersService.getAddresses(req.user.id);
  }

  @Post('addresses')
  async addAddress(@Req() req: any, @Body() body: any) {
    return this.usersService.addAddress(req.user.id, body);
  }

  @Put('addresses/:id')
  async updateAddress(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.usersService.updateAddress(req.user.id, id, body);
  }

  @Delete('addresses/:id')
  async deleteAddress(@Req() req: any, @Param('id') id: string) {
    return this.usersService.deleteAddress(req.user.id, id);
  }

  @Put('addresses/:id/default')
  async setDefaultAddress(@Req() req: any, @Param('id') id: string) {
    return this.usersService.setDefaultAddress(req.user.id, id);
  }
}
