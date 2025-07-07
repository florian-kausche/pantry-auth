import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './entities/user.entity';
import { assertValidMongoId } from 'src/common/mongo-validation.common';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      const createdUser = new this.userModel({
        ...createUserDto,
        password: hashedPassword,
      });
      return await createdUser.save();
    } catch (error) {
      console.error('Error al crear usuario:', error);
      throw new InternalServerErrorException('Error al crear el usuario');
    }
  }

  async findAll(): Promise<User[]> {
    try {
      return await this.userModel.find().exec();
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      throw new InternalServerErrorException('Error al obtener los usuarios');
    }
  }

  async findOne(id: string): Promise<User> {
    try {
      assertValidMongoId(id);
      const user = await this.userModel.findById(id).exec();
      if (!user) {
        throw new NotFoundException(`Usuario con id "${id}" no encontrado`);
      }
      return user;
    } catch (error) {
      console.error(`Error al obtener usuario con id ${id}:`, error);
      throw error;
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      assertValidMongoId(id);
      const updatedUser = await this.userModel
        .findByIdAndUpdate(id, updateUserDto, {
          new: true,
        })
        .exec();
      if (!updatedUser) {
        throw new NotFoundException(`Usuario con id "${id}" no encontrado`);
      }
      return updatedUser;
    } catch (error) {
      console.error(`Error al actualizar usuario con id ${id}:`, error);
      throw error;
    }
  }

  async remove(id: string): Promise<User> {
    try {
      assertValidMongoId(id);
      const deletedUser = await this.userModel.findByIdAndDelete(id).exec();
      if (!deletedUser) {
        throw new NotFoundException(`Usuario con id "${id}" no encontrado`);
      }
      return deletedUser;
    } catch (error) {
      console.error(`Error al eliminar usuario con id ${id}:`, error);
      throw error;
    }
  }

  async findByEmail(email: string): Promise<UserDocument> {
    try {
      const user = await this.userModel.findOne({ email }).exec();

      if (!user) {
        throw new NotFoundException(
          `No se encontró un usuario con el email "${email}"`,
        );
      }
      return user;
    } catch (error) {
      console.error(`Error al buscar usuario por email: ${email}`, error);
      throw new InternalServerErrorException('Error al buscar el usuario');
    }
  }
}
