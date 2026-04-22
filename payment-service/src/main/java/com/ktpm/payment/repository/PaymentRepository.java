package com.ktpm.payment.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public class PaymentRepository {

    private final JdbcTemplate jdbcTemplate;

    public PaymentRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public String savePayment(String bookingId, double amount, String paymentMethod, String status) {
        String id = UUID.randomUUID().toString();
        String sql = "INSERT INTO payments (id, booking_id, amount, payment_method, status) VALUES (?::uuid, ?::uuid, ?, ?, ?)";
        jdbcTemplate.update(sql, id, bookingId, amount, paymentMethod, status);
        return id;
    }

    public void updatePaymentStatus(String id, String status, String transactionId) {
        String sql = "UPDATE payments SET status = ?, transaction_id = ? WHERE id = ?::uuid";
        jdbcTemplate.update(sql, status, transactionId, id);
    }
}
