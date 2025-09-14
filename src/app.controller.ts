import { Controller, Get } from '@nestjs/common';
import { getProcessUptime } from './utils/time.utils';

@Controller()
export class AppController {
  @Get('health')
  getHealth() {
    const uptime = getProcessUptime();

    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      uptime: uptime.formatted,
      uptimeSeconds: uptime.seconds,
    };
  }
}
