package com.example.invoice.service;

import org.springframework.stereotype.Component;

import java.util.concurrent.atomic.AtomicLong;

@Component
public class InvoiceNumberGenerator {
    private final AtomicLong counter = new AtomicLong(1);

    public String nextNumber() {
        long n = counter.getAndIncrement();
        long mod = n % 100_000_000L;
        return String.format("%08d", mod);
    }
}
