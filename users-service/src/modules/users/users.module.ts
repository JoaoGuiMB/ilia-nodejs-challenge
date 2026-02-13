import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersRepository } from './users.repository';
import { USERS_REPOSITORY } from './interfaces/users-repository.interface';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [
    UsersRepository,
    {
      provide: USERS_REPOSITORY,
      useExisting: UsersRepository,
    },
  ],
  exports: [USERS_REPOSITORY, UsersRepository],
})
export class UsersModule {}
