import { Controller, Post, Body } from '@nestjs/common';
import { ContactService } from './contact.service';

export class CreateContactDto {
  firstName!: string;
  lastName!: string;
  email!: string;
  topic!: string;
  message!: string;
  orderNumber?: string;
}

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  async submitContact(@Body() dto: CreateContactDto) {
    return this.contactService.createMessage(dto);
  }
}
