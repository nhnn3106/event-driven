"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const kafka_constants_1 = require("../kafka/kafka.constants");
const users_service_1 = require("../users/users.service");
let AuthService = class AuthService {
    usersService;
    jwtService;
    userEventsPublisher;
    constructor(usersService, jwtService, userEventsPublisher) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.userEventsPublisher = userEventsPublisher;
    }
    async register(registerUserDto) {
        const email = registerUserDto.email.trim().toLowerCase();
        const fullName = registerUserDto.fullName.trim();
        const existingUser = await this.usersService.findByEmail(email);
        if (existingUser) {
            throw new common_1.ConflictException('Email already exists');
        }
        const createdUser = await this.usersService.createUser({
            email,
            password: registerUserDto.password,
            fullName,
        });
        const eventPayload = {
            userId: createdUser.id,
            email: createdUser.email,
            fullName: createdUser.fullName || '',
        };
        await this.userEventsPublisher.publishUserRegistered(eventPayload);
        return this.usersService.toPublicUser(createdUser);
    }
    async login(loginDto) {
        const email = loginDto.email.trim().toLowerCase();
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const isPasswordValid = await this.usersService.isPasswordValid(loginDto.password, user.passwordHash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const accessToken = await this.jwtService.signAsync({
            sub: user.id,
            email: user.email,
        });
        return {
            accessToken,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName || '',
                role: user.role,
            },
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Inject)(kafka_constants_1.USER_EVENTS_PUBLISHER)),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService, Object])
], AuthService);
//# sourceMappingURL=auth.service.js.map