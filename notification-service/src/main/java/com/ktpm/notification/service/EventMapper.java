package com.ktpm.notification.service;

import com.ktpm.notification.event.PaymentResultEvent;
import com.ktpm.notification.event.PaymentResultPayload;

import java.util.Map;

public final class EventMapper {

    private EventMapper() {
    }

    @SuppressWarnings("unchecked")
    public static PaymentResultEvent toPaymentResultEvent(Map<String, Object> rawEvent) {
        PaymentResultEvent event = new PaymentResultEvent();
        event.setEventId(stringValue(rawEvent.get("eventId")));
        event.setEventType(stringValue(rawEvent.get("eventType")));
        event.setTimestamp(stringValue(rawEvent.get("timestamp")));

        Map<String, Object> payloadRaw = (Map<String, Object>) rawEvent.get("payload");
        PaymentResultPayload payload = new PaymentResultPayload();
        if (payloadRaw != null) {
            payload.setBookingId(stringValue(payloadRaw.get("bookingId")));
            payload.setUserId(stringValue(payloadRaw.get("userId")));
            payload.setTransactionId(stringValue(payloadRaw.get("transactionId")));
            if (payloadRaw.get("amount") != null) {
                payload.setAmount(((Number) payloadRaw.get("amount")).doubleValue());
            }
            payload.setStatus(stringValue(payloadRaw.get("status")));
            payload.setReason(stringValue(payloadRaw.get("reason")));
        }

        event.setPayload(payload);
        return event;
    }

    private static String stringValue(Object value) {
        return value == null ? null : String.valueOf(value);
    }
}
