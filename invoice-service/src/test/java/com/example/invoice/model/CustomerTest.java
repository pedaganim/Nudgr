package com.example.invoice.model;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import java.time.Instant;

import static org.assertj.core.api.Assertions.*;

class CustomerTest {
    
    private Customer customer;

    @BeforeEach
    void setUp() {
        customer = new Customer();
    }

    @Test
    void shouldInitializeWithDefaults() {
        Customer newCustomer = new Customer();
        
        assertThat(newCustomer.getCreatedAt()).isNotNull();
        assertThat(newCustomer.getId()).isNull();
    }

    @Test
    void shouldSetAndGetId() {
        customer.setId(1L);
        assertThat(customer.getId()).isEqualTo(1L);
    }

    @Test
    void shouldSetAndGetName() {
        String name = "Acme Corporation";
        customer.setName(name);
        
        assertThat(customer.getName()).isEqualTo(name);
    }

    @Test
    void shouldSetAndGetEmail() {
        String email = "contact@acme.com";
        customer.setEmail(email);
        
        assertThat(customer.getEmail()).isEqualTo(email);
    }

    @Test
    void shouldSetAndGetPhone() {
        String phone = "+1-555-123-4567";
        customer.setPhone(phone);
        
        assertThat(customer.getPhone()).isEqualTo(phone);
    }

    @Test
    void shouldSetAndGetBillingAddress() {
        String address = "123 Main Street\nNew York, NY 10001\nUSA";
        customer.setBillingAddress(address);
        
        assertThat(customer.getBillingAddress()).isEqualTo(address);
    }

    @Test
    void shouldSetAndGetShippingAddress() {
        String address = "456 Oak Avenue\nLos Angeles, CA 90001\nUSA";
        customer.setShippingAddress(address);
        
        assertThat(customer.getShippingAddress()).isEqualTo(address);
    }

    @Test
    void shouldSetAndGetTaxNumber() {
        String taxNumber = "TAX-123456789";
        customer.setTaxNumber(taxNumber);
        
        assertThat(customer.getTaxNumber()).isEqualTo(taxNumber);
    }

    @Test
    void shouldSetAndGetCreatedAt() {
        Instant now = Instant.now();
        customer.setCreatedAt(now);
        
        assertThat(customer.getCreatedAt()).isEqualTo(now);
    }

    @Test
    void shouldHandleNullOptionalFields() {
        customer.setName("Test");
        customer.setEmail("test@example.com");
        customer.setPhone(null);
        customer.setBillingAddress(null);
        customer.setShippingAddress(null);
        customer.setTaxNumber(null);
        
        assertThat(customer.getName()).isEqualTo("Test");
        assertThat(customer.getEmail()).isEqualTo("test@example.com");
        assertThat(customer.getPhone()).isNull();
        assertThat(customer.getBillingAddress()).isNull();
        assertThat(customer.getShippingAddress()).isNull();
        assertThat(customer.getTaxNumber()).isNull();
    }

    @Test
    void shouldSetAllFieldsCorrectly() {
        customer.setId(123L);
        customer.setName("Test Company");
        customer.setEmail("test@company.com");
        customer.setPhone("+1-555-999-8888");
        customer.setBillingAddress("Billing Address");
        customer.setShippingAddress("Shipping Address");
        customer.setTaxNumber("TAX-999");
        Instant now = Instant.now();
        customer.setCreatedAt(now);
        
        assertThat(customer.getId()).isEqualTo(123L);
        assertThat(customer.getName()).isEqualTo("Test Company");
        assertThat(customer.getEmail()).isEqualTo("test@company.com");
        assertThat(customer.getPhone()).isEqualTo("+1-555-999-8888");
        assertThat(customer.getBillingAddress()).isEqualTo("Billing Address");
        assertThat(customer.getShippingAddress()).isEqualTo("Shipping Address");
        assertThat(customer.getTaxNumber()).isEqualTo("TAX-999");
        assertThat(customer.getCreatedAt()).isEqualTo(now);
    }

    @Test
    void shouldAllowEmptyStrings() {
        customer.setName("");
        customer.setEmail("");
        customer.setPhone("");
        
        assertThat(customer.getName()).isEmpty();
        assertThat(customer.getEmail()).isEmpty();
        assertThat(customer.getPhone()).isEmpty();
    }
}
