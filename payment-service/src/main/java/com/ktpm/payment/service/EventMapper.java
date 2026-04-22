package com.ktpm.payment.service;

import com.ktpm.payment.event.BookingCreatedEvent;
import com.ktpm.payment.event.BookingCreatedPayload;

import java.util.Map;

public final class EventMapper {

    private EventMapper() {
    }

    @SuppressWarnings("unchecked")
    public static BookingCreatedEvent toBookingCreatedEvent(Map<String, Object> rawEvent) {
        BookingCreatedEvent event = new BookingCreatedEvent();
        event.setEventId(stringValue(rawEvent.get("eventId")));
        event.setEventType(stringValue(rawEvent.get("eventType")));
        event.setTimestamp(stringValue(rawEvent.get("timestamp")));

        Map<String, Object> payloadRaw = (Map<String, Object>) rawEvent.get("payload");
        BookingCreatedPayload payload = new BookingCreatedPayload();
        payload.setBookingId(stringValue(payloadRaw.get("bookingId")));
        payload.setUserId(stringValue(payloadRaw.get("userId")));
        payload.setMovieId(stringValue(payloadRaw.get("movieId")));
        payload.setSeatNumber(stringValue(payloadRaw.get("seatNumber")));
        if (payloadRaw.get("amount") != null) {
            payload.setAmount(((Number) payloadRaw.get("amount")).doubleValue());
        }

        event.setPayload(payload);
        return event;
    }

    private static String stringValue(Object value) {
        return value == null ? null : String.valueOf(value);
    }
}
