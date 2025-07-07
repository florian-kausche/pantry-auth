import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { UpdateTokenDto } from 'src/security/dto/update-token.dto';
import { User, UserDocument } from './entities/user.entity';
import { assertValidMongoId } from 'src/common/mongo-validation.common';

@Injectable()
export class TokenService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}
  async updateToken(id: string, updateTokenDto: UpdateTokenDto): Promise<User> {
    try {
      assertValidMongoId(id);
      const expirationToken = new Date(Date.now() + 60 * 60 * 1000);

      const updatedUser = await this.userModel
        .findByIdAndUpdate(
          id,
          {
            token: updateTokenDto.token,
            expirationToken,
          },
          { new: true },
        )
        .exec();

      if (!updatedUser) {
        throw new NotFoundException(`User with id "${id}" not found`);
      }

      return updatedUser;
    } catch (error) {
      console.error(`Error updating token for user id ${id}:`, error);
      throw error;
    }
  }
}
