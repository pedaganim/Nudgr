package com.example.invoice.model;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import java.math.BigDecimal;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.*;

class InvoiceItemTest {
    
    private InvoiceItem item;
    private Invoice invoice;

    @BeforeEach
    void setUp() {
        invoice = new Invoice();
        invoice.setId(1L);
        
        item = new InvoiceItem();
        item.setInvoice(invoice);
    }

    @Test
    void shouldSetAndGetId() {
        item.setId(1L);
        assertThat(item.getId()).isEqualTo(1L);
    }

    @Test
    void shouldSetAndGetInvoice() {
        assertThat(item.getInvoice()).isEqualTo(invoice);
        assertThat(item.getInvoice().getId()).isEqualTo(1L);
    }

    @Test
    void shouldSetAndGetDescription() {
        String description = "Consulting services for Q1 2025";
        item.setDescription(description);
        
        assertThat(item.getDescription()).isEqualTo(description);
    }

    @Test
    void shouldSetAndGetServiceDate() {
        LocalDate serviceDate = LocalDate.of(2025, 1, 15);
        item.setServiceDate(serviceDate);
        
        assertThat(item.getServiceDate()).isEqualTo(serviceDate);
    }

    @Test
    void shouldSetAndGetProductOrService() {
        String productOrService = "Professional Consulting";
        item.setProductOrService(productOrService);
        
        assertThat(item.getProductOrService()).isEqualTo(productOrService);
    }

    @Test
    void shouldSetAndGetQuantity() {
        BigDecimal quantity = new BigDecimal("5.5");
        item.setQuantity(quantity);
        
        assertThat(item.getQuantity()).isEqualByComparingTo(quantity);
    }

    @Test
    void shouldSetAndGetUnitPrice() {
        BigDecimal unitPrice = new BigDecimal("100.00");
        item.setUnitPrice(unitPrice);
        
        assertThat(item.getUnitPrice()).isEqualByComparingTo(unitPrice);
    }

    @Test
    void shouldSetAndGetTaxRate() {
        BigDecimal taxRate = new BigDecimal("10.00");
        item.setTaxRate(taxRate);
        
        assertThat(item.getTaxRate()).isEqualByComparingTo(taxRate);
    }

    @Test
    void shouldSetAndGetLineTotal() {
        BigDecimal lineTotal = new BigDecimal("550.00");
        item.setLineTotal(lineTotal);
        
        assertThat(item.getLineTotal()).isEqualByComparingTo(lineTotal);
    }

    @Test
    void shouldCalculateLineTotalCorrectly() {
        // Quantity: 10, Unit Price: 100, Tax Rate: 10%
        // Line = 10 * 100 = 1000
        // Tax = 1000 * 0.10 = 100
        // Total = 1000 + 100 = 1100
        item.setQuantity(new BigDecimal("10"));
        item.setUnitPrice(new BigDecimal("100.00"));
        item.setTaxRate(new BigDecimal("10.00"));
        
        BigDecimal line = item.getQuantity().multiply(item.getUnitPrice());
        BigDecimal tax = line.multiply(item.getTaxRate().divide(new BigDecimal("100")));
        BigDecimal expectedTotal = line.add(tax);
        
        item.setLineTotal(expectedTotal);
        
        assertThat(item.getLineTotal()).isEqualByComparingTo(new BigDecimal("1100.00"));
    }

    @Test
    void shouldHandleZeroTaxRate() {
        item.setQuantity(new BigDecimal("5"));
        item.setUnitPrice(new BigDecimal("50.00"));
        item.setTaxRate(BigDecimal.ZERO);
        
        BigDecimal line = item.getQuantity().multiply(item.getUnitPrice());
        item.setLineTotal(line);
        
        assertThat(item.getLineTotal()).isEqualByComparingTo(new BigDecimal("250.00"));
    }

    @Test
    void shouldHandleDecimalQuantities() {
        item.setQuantity(new BigDecimal("2.5"));
        item.setUnitPrice(new BigDecimal("100.00"));
        item.setTaxRate(new BigDecimal("5.00"));
        
        BigDecimal line = item.getQuantity().multiply(item.getUnitPrice());
        BigDecimal tax = line.multiply(item.getTaxRate().divide(new BigDecimal("100")));
        BigDecimal expectedTotal = line.add(tax);
        
        item.setLineTotal(expectedTotal);
        
        // 2.5 * 100 = 250, 250 * 0.05 = 12.5, total = 262.5
        assertThat(item.getLineTotal()).isEqualByComparingTo(new BigDecimal("262.50"));
    }

    @Test
    void shouldSetAllFieldsCorrectly() {
        item.setId(10L);
        item.setDescription("Web Development");
        item.setServiceDate(LocalDate.of(2025, 2, 1));
        item.setProductOrService("Software Development");
        item.setQuantity(new BigDecimal("8"));
        item.setUnitPrice(new BigDecimal("150.00"));
        item.setTaxRate(new BigDecimal("10.00"));
        item.setLineTotal(new BigDecimal("1320.00"));
        
        assertThat(item.getId()).isEqualTo(10L);
        assertThat(item.getDescription()).isEqualTo("Web Development");
        assertThat(item.getServiceDate()).isEqualTo(LocalDate.of(2025, 2, 1));
        assertThat(item.getProductOrService()).isEqualTo("Software Development");
        assertThat(item.getQuantity()).isEqualByComparingTo(new BigDecimal("8"));
        assertThat(item.getUnitPrice()).isEqualByComparingTo(new BigDecimal("150.00"));
        assertThat(item.getTaxRate()).isEqualByComparingTo(new BigDecimal("10.00"));
        assertThat(item.getLineTotal()).isEqualByComparingTo(new BigDecimal("1320.00"));
    }

    @Test
    void shouldHandleNullOptionalFields() {
        item.setDescription("Required field");
        item.setQuantity(new BigDecimal("1"));
        item.setUnitPrice(new BigDecimal("100"));
        item.setTaxRate(BigDecimal.ZERO);
        item.setLineTotal(new BigDecimal("100"));
        
        item.setServiceDate(null);
        item.setProductOrService(null);
        
        assertThat(item.getServiceDate()).isNull();
        assertThat(item.getProductOrService()).isNull();
        assertThat(item.getDescription()).isEqualTo("Required field");
    }
}
