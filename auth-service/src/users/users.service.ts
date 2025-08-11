import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { User, UserDocument } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async verifyUserExists(email: string): Promise<UserDocument> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new NotFoundException(`No existe usuario con email: ${email}`);
    }
    return user;
  }
}
