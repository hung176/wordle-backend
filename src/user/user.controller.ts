import { Body, Controller, Param, Post, Put } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from './dto';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}
  @Post()
  async create(@Body() userData: CreateUserDto) {
    return await this.userService.create(userData);
  }

  @Put(':id')
  async updateById(
    @Param('id') id: string,
    @Body() data: UpdateUserDto,
  ): Promise<void> {
    await this.userService.updateById(id, data);
  }
}
