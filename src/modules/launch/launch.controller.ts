import { Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { LaunchService } from './launch.service';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RequestWithUser } from 'src/common/utils/RequestWithUser';
import { LaunchStepData, StepCompleteResponse } from './dto/launch.dto';

@Controller('launch')
@UseGuards(AuthGuard)
export class LaunchController {
  constructor(private readonly launchService: LaunchService) {}

  /**
   * Get all the completed steps for the user
   */

  @Get('completed-steps')
  getCompletedSteps(@Req() req: RequestWithUser): Promise<string[]> {
    return this.launchService.getCompletedSteps(req.user.id);
  }

  /**
   * Get data for specific step
   */
  @Get(':stepKey')
  getStepData(
    @Req() req: RequestWithUser,
    @Param('stepKey') stepKey: string,
  ): Promise<LaunchStepData> {
    return this.launchService.getStepData(req.user.id, stepKey);
  }

  /**
   * Mark a step as completed
   */
  @Post(':stepKey/complete')
  markStepComplete(
    @Req() req: RequestWithUser,
    @Param('stepKey') stepKey: string,
  ): Promise<StepCompleteResponse> {
    return this.launchService.markStepComplete(req.user.id, stepKey);
  }
}
