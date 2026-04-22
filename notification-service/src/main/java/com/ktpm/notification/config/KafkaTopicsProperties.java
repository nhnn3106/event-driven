package com.ktpm.notification.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.kafka.topics")
public class KafkaTopicsProperties {
    private String paymentEvents;

    public String getPaymentEvents() {
        return paymentEvents;
    }

    public void setPaymentEvents(String paymentEvents) {
        this.paymentEvents = paymentEvents;
    }
}
