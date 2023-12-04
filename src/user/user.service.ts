import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { CreateUserDto, UpdateUserDto } from './dto';

export type UserResponse = Pick<UserDocument, 'email'> & {
  userId: string;
};

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModal: Model<UserDocument>) {}

  async create(user: CreateUserDto): Promise<UserResponse> {
    try {
      user.password = await this.hashPassword(user.password);
      const createUser = new this.userModal(user);
      const newUser = await createUser.save();
      const { _id, email } = newUser;
      const userId = _id.toString() as string;
      return { userId, email };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateById(
    id: string,
    updateData: UpdateUserDto,
  ): Promise<UserResponse> {
    const user = await this.userModal.findById(id);

    if (!user) {
      throw new NotFoundException();
    }

    if (updateData.email) {
      user.email = updateData.email;
    }
    if (updateData.password) {
      user.password = await this.hashPassword(updateData.password);
    }
    user.updatedAt = new Date();
    const { _id, email } = await user.save();
    const userId = _id.toString() as string;
    return { userId, email };
  }

  async findUserByEmail(email: string): Promise<UserDocument> {
    const user = await this.userModal.findOne({ email }, { _id: 0, __v: 0 });
    return user;
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }
}
