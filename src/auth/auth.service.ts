import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(private userService: UserService) {}

  async signUp() {
    return 'Sign up';
  }

  signIn() {
    return 'Sign in';
  }
}
