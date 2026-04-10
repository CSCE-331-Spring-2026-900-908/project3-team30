package com.project3.server.controller;

import com.project3.server.model.OrderRequest;
import com.project3.server.model.OrderResponse;
import com.project3.server.service.CheckoutService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Handles checkout-related HTTP requests.
 * @author Rylee Hunt
 */
@RestController
@RequestMapping("/api/orders")
public class CheckoutController {

    private final CheckoutService checkoutService;

    public CheckoutController(CheckoutService checkoutService) {
        this.checkoutService = checkoutService;
    }

    /**
     * POST /api/orders
     *
     * Processes a completed order.
     */
    @PostMapping
    public ResponseEntity<?> processOrder(@RequestBody OrderRequest request) {
        try {
            OrderResponse response = checkoutService.processOrder(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new OrderResponse(0, request.getPaymentMethod(), request.getTotal(), e.getMessage()));
        }
    }

    /**
     * POST /api/orders/cancel
     *
     * Records a cancelled order.
     */
    @PostMapping("/cancel")
    public ResponseEntity<?> cancelOrder(@RequestBody OrderRequest request) {
        try {
            OrderResponse response = checkoutService.cancelOrder(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new OrderResponse(0, null, request.getTotal(), e.getMessage()));
        }
    }
}