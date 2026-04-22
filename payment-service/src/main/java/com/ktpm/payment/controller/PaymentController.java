package com.ktpm.payment.controller;

import com.ktpm.payment.event.BookingCreatedEvent;
import com.ktpm.payment.event.BookingCreatedPayload;
import com.ktpm.payment.service.PaymentProcessor;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/payments")
@Validated
public class PaymentController {

    private final PaymentProcessor paymentProcessor;

    public PaymentController(PaymentProcessor paymentProcessor) {
        this.paymentProcessor = paymentProcessor;
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "UP", "service", "payment-service");
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> simulatePayment(@RequestBody ManualPaymentRequest request) {
        BookingCreatedPayload payload = new BookingCreatedPayload();
        payload.setBookingId(request.bookingId());
        payload.setUserId(request.userId());
        payload.setMovieId(request.movieId());
        payload.setSeatNumber(request.seatNumber());
        payload.setAmount(request.amount());

        BookingCreatedEvent event = new BookingCreatedEvent();
        event.setEventId(UUID.randomUUID().toString());
        event.setEventType("BOOKING_CREATED");
        event.setTimestamp(Instant.now().toString());
        event.setPayload(payload);

        paymentProcessor.processAndPublishPaymentResult(event);

        return ResponseEntity.ok(Map.of("message", "Payment event handled"));
    }

    public record ManualPaymentRequest(
            @NotBlank String bookingId,
            @NotBlank String userId,
            @NotBlank String movieId,
            @NotBlank String seatNumber,
            double amount
    ) {
    }
}
