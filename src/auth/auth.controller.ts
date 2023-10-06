import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  async signUp(@Body() authDto: AuthDto) {
    return await this.authService.signUp(authDto);
  }

  @Post('/signin')
  async signIn(@Body() authDto: AuthDto) {
    return await this.authService.signIn(authDto);
  }
}
