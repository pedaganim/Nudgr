package com.example.invoice.customer;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

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
    @ResponseStatus(HttpStatus.CREATED)
    public Customer create(@RequestBody Customer c) { return repo.save(c); }

    @PutMapping("/{id}")
    public Customer update(@PathVariable Long id, @RequestBody Customer c) {
        Customer existing = repo.findById(id).orElseThrow();
        existing.setName(c.getName());
        existing.setEmail(c.getEmail());
        existing.setPhone(c.getPhone());
        existing.setBillingAddress(c.getBillingAddress());
        existing.setShippingAddress(c.getShippingAddress());
        existing.setTaxNumber(c.getTaxNumber());
        return existing;
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) { repo.deleteById(id); }
}
