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
exports.BookingsService = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const kafka_constants_1 = require("../kafka/kafka.constants");
const prisma_service_1 = require("../prisma/prisma.service");
let BookingsService = class BookingsService {
    prismaService;
    bookingEventsPublisher;
    bookingSubject = new rxjs_1.Subject();
    constructor(prismaService, bookingEventsPublisher) {
        this.prismaService = prismaService;
        this.bookingEventsPublisher = bookingEventsPublisher;
    }
    getBookingEvents() {
        return this.bookingSubject.asObservable();
    }
    async create(createBookingDto) {
        const createdBooking = await this.prismaService.booking.create({
            data: {
                userId: createBookingDto.userId,
                movieId: createBookingDto.movieId,
                seatNumber: createBookingDto.seatNumber,
                totalPrice: createBookingDto.totalPrice,
                paymentMethod: createBookingDto.paymentMethod || 'COD',
            },
        });
        const payload = {
            bookingId: createdBooking.id,
            userId: createdBooking.userId,
            movieId: createdBooking.movieId,
            seatNumber: createdBooking.seatNumber,
            amount: Number(createdBooking.totalPrice),
        };
        await this.bookingEventsPublisher.publishBookingCreated(payload);
        const returnData = {
            ...createdBooking,
            totalPrice: Number(createdBooking.totalPrice),
            createdAt: createdBooking.createdAt.toISOString(),
        };
        this.bookingSubject.next({ type: 'BOOKING_CREATED', data: returnData });
        return returnData;
    }
    async findAll(userId) {
        const where = userId ? { userId } : {};
        const bookings = await this.prismaService.booking.findMany({
            where,
            orderBy: {
                createdAt: 'desc',
            },
        });
        return bookings.map(b => ({
            ...b,
            totalPrice: Number(b.totalPrice),
            createdAt: b.createdAt.toISOString(),
        }));
    }
    async handlePaymentEvent(payload) {
        const status = payload.status === 'SUCCESS' ? 'CONFIRMED' : 'CANCELLED';
        await this.updateStatus(payload.bookingId, status);
    }
    async updateStatus(id, status) {
        const updated = await this.prismaService.booking.update({
            where: { id },
            data: { status },
        });
        const returnData = {
            ...updated,
            totalPrice: Number(updated.totalPrice),
            createdAt: updated.createdAt.toISOString(),
        };
        this.bookingSubject.next({ type: 'BOOKING_UPDATED', data: returnData });
        return returnData;
    }
    async getOccupiedSeats(movieId) {
        const bookings = await this.prismaService.booking.findMany({
            where: {
                movieId,
                status: { in: ['PENDING', 'CONFIRMED'] },
            },
            select: { seatNumber: true },
        });
        return bookings.map(b => b.seatNumber);
    }
};
exports.BookingsService = BookingsService;
exports.BookingsService = BookingsService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(kafka_constants_1.BOOKING_EVENTS_PUBLISHER)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, Object])
], BookingsService);
//# sourceMappingURL=bookings.service.js.map