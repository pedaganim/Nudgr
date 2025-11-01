package com.example.invoice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.invoice.model.Customer;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    boolean existsByEmail(String email);
}
