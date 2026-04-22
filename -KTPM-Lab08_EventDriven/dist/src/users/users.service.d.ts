import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
export type PublicUser = Omit<User, 'passwordHash' | 'fullName' | 'role'> & {
    fullName: string;
    role: string;
};
export declare class UsersService {
    private readonly prismaService;
    constructor(prismaService: PrismaService);
    findByEmail(email: string): Promise<User | null>;
    createUser(input: {
        email: string;
        password: string;
        fullName: string;
        role?: 'ADMIN' | 'USER';
    }): Promise<User>;
    isPasswordValid(password: string, hashedPassword: string): Promise<boolean>;
    toPublicUser(user: User): PublicUser;
}
