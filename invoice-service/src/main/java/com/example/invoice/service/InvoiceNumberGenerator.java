package com.example.invoice.service;

import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.concurrent.atomic.AtomicLong;

@Component
public class InvoiceNumberGenerator {
    private final AtomicLong counter = new AtomicLong(1);

    public String nextNumber() {
        String year = String.valueOf(LocalDate.now().getYear());
        long n = counter.getAndIncrement();
        return String.format("INV-%s-%06d", year, n);
    }
}
