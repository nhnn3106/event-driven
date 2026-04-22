import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

export type PublicUser = Omit<User, 'passwordHash' | 'fullName' | 'role'> & { fullName: string; role: string };

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.prismaService.user.findUnique({
      where: { email },
    });
  }

  async createUser(input: {
    email: string;
    password: string;
    fullName: string;
    role?: 'ADMIN' | 'USER';
  }): Promise<User> {
    const passwordHash = await bcrypt.hash(input.password, 10);

    return this.prismaService.user.create({
      data: {
        email: input.email,
        passwordHash,
        fullName: input.fullName,
        role: input.role || 'USER',
      },
    });
  }

  async isPasswordValid(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  toPublicUser(user: User): PublicUser {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName || '',
      role: user.role,
      createdAt: user.createdAt,
    };
  }
}
