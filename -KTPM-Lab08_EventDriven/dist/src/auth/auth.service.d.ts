import { JwtService } from '@nestjs/jwt';
import { UserEventsPublisher } from '../kafka/user-events.publisher.interface';
import { PublicUser, UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterUserDto } from './dto/register-user.dto';
export interface LoginResponse {
    accessToken: string;
    user: {
        id: string;
        email: string;
        fullName: string;
        role: string;
    };
}
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    private readonly userEventsPublisher;
    constructor(usersService: UsersService, jwtService: JwtService, userEventsPublisher: UserEventsPublisher);
    register(registerUserDto: RegisterUserDto): Promise<PublicUser>;
    login(loginDto: LoginDto): Promise<LoginResponse>;
}
