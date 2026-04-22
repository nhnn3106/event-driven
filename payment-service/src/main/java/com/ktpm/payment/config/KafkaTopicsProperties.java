package com.ktpm.payment.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.kafka.topics")
public class KafkaTopicsProperties {
    private String bookingEvents;
    private String paymentEvents;

    public String getBookingEvents() {
        return bookingEvents;
    }

    public void setBookingEvents(String bookingEvents) {
        this.bookingEvents = bookingEvents;
    }

    public String getPaymentEvents() {
        return paymentEvents;
    }

    public void setPaymentEvents(String paymentEvents) {
        this.paymentEvents = paymentEvents;
    }
}
