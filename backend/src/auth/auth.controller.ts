import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiBody({
    schema: {
      properties: {
        email: { type: 'string', example: 'admin@katsuolive.com' },
        password: { type: 'string', example: 'password123' },
      },
    },
  })
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Post('register')
  @ApiOperation({ summary: 'User registration' })
  @ApiBody({
    schema: {
      properties: {
        email: { type: 'string', example: 'user@example.com' },
        username: { type: 'string', example: 'username' },
        password: { type: 'string', example: 'password123' },
      },
    },
  })
  async register(
    @Body('email') email: string,
    @Body('username') username: string,
    @Body('password') password: string,
  ) {
    return this.authService.register(email, username, password);
  }
}
