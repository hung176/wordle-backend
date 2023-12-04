import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/user/user.service';
import { AuthDto } from './dto';
import { UserResponse } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(private userService: UserService) {}

  async signUp(authDto: AuthDto): Promise<UserResponse> {
    return await this.userService.create(authDto);
  }

  async signIn(authDto: AuthDto): Promise<UserResponse> {
    const findUser = await this.userService.findUserByEmail(authDto.email);
    if (!findUser) {
      throw new NotFoundException('User is not existed');
    }

    const isCorrectPassword = await bcrypt.compare(
      authDto.password,
      findUser.password,
    );

    if (!isCorrectPassword) {
      throw new UnauthorizedException();
    }

    return findUser.toObject({
      transform: (_doc, ret) => {
        delete ret.password;
        return ret;
      },
    });
  }
}
