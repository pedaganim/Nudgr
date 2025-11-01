package com.example.invoice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.invoice.model.Payment;

public interface PaymentRepository extends JpaRepository<Payment, Long> {}
