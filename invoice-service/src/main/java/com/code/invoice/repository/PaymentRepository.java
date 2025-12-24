package com.code.invoice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.code.invoice.model.Payment;

public interface PaymentRepository extends JpaRepository<Payment, Long> {}
