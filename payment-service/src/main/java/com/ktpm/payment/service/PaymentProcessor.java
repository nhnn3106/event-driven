package com.ktpm.payment.service;

import com.ktpm.payment.config.KafkaTopicsProperties;
import com.ktpm.payment.event.BookingCreatedEvent;
import com.ktpm.payment.event.PaymentResultEvent;
import com.ktpm.payment.event.PaymentResultPayload;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.Random;
import java.util.UUID;

@Service
public class PaymentProcessor {
    private static final Logger LOGGER = LoggerFactory.getLogger(PaymentProcessor.class);

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final KafkaTopicsProperties topicsProperties;
    private final Random random = new Random();

    private final com.ktpm.payment.repository.PaymentRepository paymentRepository;

    public PaymentProcessor(KafkaTemplate<String, Object> kafkaTemplate, KafkaTopicsProperties topicsProperties, com.ktpm.payment.repository.PaymentRepository paymentRepository) {
        this.kafkaTemplate = kafkaTemplate;
        this.topicsProperties = topicsProperties;
        this.paymentRepository = paymentRepository;
    }

    @KafkaListener(topics = "${app.kafka.topics.booking-events}", groupId = "${spring.kafka.consumer.group-id}")
    public void onBookingEvent(Map<String, Object> rawEvent) {
        Object eventType = rawEvent.get("eventType");
        if (!"BOOKING_CREATED".equals(eventType)) {
            return;
        }

        BookingCreatedEvent bookingEvent = EventMapper.toBookingCreatedEvent(rawEvent);
        processAndPublishPaymentResult(bookingEvent);
    }

    public void processAndPublishPaymentResult(BookingCreatedEvent bookingEvent) {
        String bookingId = bookingEvent.getPayload().getBookingId();
        double amount = bookingEvent.getPayload().getAmount();

        // Save PENDING payment
        String paymentId = paymentRepository.savePayment(bookingId, amount, "BANKING", "PENDING");

        boolean success = random.nextBoolean();
        String resultEventType = success ? "PAYMENT_COMPLETED" : "BOOKING_FAILED";
        String transactionId = UUID.randomUUID().toString();
        String status = success ? "SUCCESS" : "FAILED";

        // Update payment status
        paymentRepository.updatePaymentStatus(paymentId, status, transactionId);

        PaymentResultPayload payload = new PaymentResultPayload();
        payload.setBookingId(bookingId);
        payload.setUserId(bookingEvent.getPayload().getUserId());
        payload.setTransactionId(transactionId);
        payload.setAmount(amount);
        payload.setStatus(status);
        if (!success) {
            payload.setReason("Payment failed due to simulated gateway error");
        }

        PaymentResultEvent resultEvent = new PaymentResultEvent();
        resultEvent.setEventId(UUID.randomUUID().toString());
        resultEvent.setEventType(resultEventType);
        resultEvent.setTimestamp(Instant.now().toString());
        resultEvent.setPayload(payload);

        kafkaTemplate.send(topicsProperties.getPaymentEvents(), payload.getBookingId(), resultEvent);

        LOGGER.info("Payment processed for booking {} with status {}",
                payload.getBookingId(), payload.getStatus());
    }
}
