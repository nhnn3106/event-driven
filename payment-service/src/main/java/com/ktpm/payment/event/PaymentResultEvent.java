package com.ktpm.payment.event;

public class PaymentResultEvent {
    private String eventId;
    private String eventType;
    private String timestamp;
    private PaymentResultPayload payload;

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

    public PaymentResultPayload getPayload() {
        return payload;
    }

    public void setPayload(PaymentResultPayload payload) {
        this.payload = payload;
    }
}
