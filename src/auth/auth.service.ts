import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/user/user.service';
import { AuthDto } from './dto';
import { UserDocument } from 'src/user/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(private userService: UserService) {}

  async signUp(authDto: AuthDto): Promise<UserDocument> {
    return await this.userService.create(authDto);
  }

  async signIn(authDto: AuthDto): Promise<UserDocument> {
    const findUser = await this.userService.findUserByEmail(authDto.email);
    if (!findUser) {
      throw new NotFoundException('user is not existed');
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
