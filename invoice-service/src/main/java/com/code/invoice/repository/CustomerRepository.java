package com.code.invoice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.code.invoice.model.Customer;
import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    boolean existsByEmail(String email);
    Optional<Customer> findByEmail(String email);
}
