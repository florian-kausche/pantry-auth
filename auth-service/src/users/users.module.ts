import { Module, OnModuleInit } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UsersService } from './users.service';
import { User, UserSchema } from './entities/user.entity';
import * as bcrypt from 'bcryptjs';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [UsersService],
  exports: [UsersService, MongooseModule],
})
export class UsersModule implements OnModuleInit {
  constructor(private readonly usersService: UsersService) {}

  async onModuleInit() {
    
    const email = process.env.SEED_USER_EMAIL;
    const password = process.env.SEED_USER_PASSWORD;
    if (!email || !password) return;

    const existing = await this.usersService.findByEmail(email);
    if (!existing) {
      const model: any = (this.usersService as any).userModel;
      const hashed = await bcrypt.hash(password, 10);
      await model.create({ email, password: hashed, isActive: true });
      
      console.log(`Seeded test user: ${email} / ${password}`);
    }
  }
}
