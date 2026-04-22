package com.ktpm.notification.service;

import com.ktpm.notification.event.PaymentResultEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class NotificationConsumer {
    private static final Logger LOGGER = LoggerFactory.getLogger(NotificationConsumer.class);

    @KafkaListener(topics = "${app.kafka.topics.payment-events}", groupId = "${spring.kafka.consumer.group-id}")
    public void onPaymentResult(Map<String, Object> rawEvent) {
        Object eventType = rawEvent.get("eventType");
        if (!"PAYMENT_COMPLETED".equals(eventType)) {
            return;
        }

        PaymentResultEvent event = EventMapper.toPaymentResultEvent(rawEvent);
        String bookingId = event.getPayload() == null ? "unknown" : event.getPayload().getBookingId();
        String userId = event.getPayload() == null ? "unknown" : event.getPayload().getUserId();

        LOGGER.info("Booking #{} thanh cong! User {} da dat ve thanh cong.", bookingId, userId);
    }
}
