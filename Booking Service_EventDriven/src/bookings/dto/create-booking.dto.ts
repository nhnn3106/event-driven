import { IsNumber, IsString, IsUUID, IsOptional } from 'class-validator';

export class CreateBookingDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  movieId: string;

  @IsString()
  seatNumber: string;

  @IsNumber()
  totalPrice: number;

  @IsString()
  @IsOptional()
  paymentMethod?: string;
}
