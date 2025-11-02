package com.example.invoice.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.invoice.repository.CustomerRepository;
import com.example.invoice.model.Customer;
import java.util.Optional;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {
    private final CustomerRepository repo;
    public CustomerController(CustomerRepository repo) { this.repo = repo; }

    @GetMapping
    public Page<Customer> list(Pageable pageable) { return repo.findAll(pageable); }

    @GetMapping("/{id}")
    public Customer get(@PathVariable Long id) { return repo.findById(id).orElseThrow(); }

    @PostMapping
    public ResponseEntity<Customer> create(@RequestBody Customer c) {
        Optional<Customer> existing = repo.findByEmail(c.getEmail());
        if (existing.isPresent()) {
            return ResponseEntity.ok(existing.get());
        }
        Customer saved = repo.save(c);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public Customer update(@PathVariable Long id, @RequestBody Customer c) {
        Customer existing = repo.findById(id).orElseThrow();
        existing.setName(c.getName());
        existing.setEmail(c.getEmail());
        existing.setPhone(c.getPhone());
        existing.setBillingAddress(c.getBillingAddress());
        existing.setShippingAddress(c.getShippingAddress());
        existing.setTaxNumber(c.getTaxNumber());
        return repo.save(existing);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) { repo.deleteById(id); }
}
