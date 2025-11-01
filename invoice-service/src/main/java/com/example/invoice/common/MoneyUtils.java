package com.example.invoice.common;

import java.math.BigDecimal;
import java.math.RoundingMode;

public final class MoneyUtils {
    private MoneyUtils() {}
    public static BigDecimal scale(BigDecimal v) {
        if (v == null) return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        return v.setScale(2, RoundingMode.HALF_UP);
    }
    public static BigDecimal add(BigDecimal a, BigDecimal b) {
        return scale(scale(a).add(scale(b)));
    }
    public static BigDecimal sub(BigDecimal a, BigDecimal b) {
        return scale(scale(a).subtract(scale(b)));
    }
    public static BigDecimal mul(BigDecimal a, BigDecimal b) {
        return scale(scale(a).multiply(scale(b)));
    }
}
