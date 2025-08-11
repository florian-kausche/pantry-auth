import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import { UsersModule } from './users/users.module';
import { SecurityModule } from './security/security.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const useMemory = (configService.get<string>('MONGODB_MEMORY') || 'false') === 'true';
        let uri = configService.get<string>('MONGODB_URI');
        if (useMemory) {
          const mem = await MongoMemoryServer.create();
          uri = mem.getUri();
        }
        return { uri };
      },
    }),

    UsersModule,
    SecurityModule,
    EmailModule,
  ],
})
export class AppModule {}
