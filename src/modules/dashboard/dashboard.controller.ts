import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { Request } from 'express';
import { DashboardResponse } from './types/dashboard.types';
import { AuthGuard } from 'src/common/guards/auth.guard';

@Controller('dashboard')
@UseGuards(AuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  async getDashboard(@Req() req: Request): Promise<DashboardResponse> {
    const userId = req['user']?.id;

    if (!userId) {
      throw new Error('User ID not found in request');
    }

    return this.dashboardService.getDashboard(userId);
  }
}
