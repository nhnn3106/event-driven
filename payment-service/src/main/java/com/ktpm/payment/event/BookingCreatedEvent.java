package com.ktpm.payment.event;

public class BookingCreatedEvent {
    private String eventId;
    private String eventType;
    private String timestamp;
    private BookingCreatedPayload payload;

    public String getEventId() {
        return eventId;
    }

    public void setEventId(String eventId) {
        this.eventId = eventId;
    }

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    public BookingCreatedPayload getPayload() {
        return payload;
    }

    public void setPayload(BookingCreatedPayload payload) {
        this.payload = payload;
    }
}
