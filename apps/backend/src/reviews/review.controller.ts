import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(@Req() req: Request, @Body() dto: CreateReviewDto) {
    const userId = (req.user as any)?.id;
    return this.reviewService.create(userId, dto);
  }

  @Get(':bookId')
  async findAllByBook(@Param('bookId') bookId: string) {
    return this.reviewService.findAllByBook(bookId);
  }

  @Get(':bookId/stats')
  async getStats(@Param('bookId') bookId: string) {
    return this.reviewService.getAverageRating(bookId);
  }
}
