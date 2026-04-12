package com.project3.server.controller;

import com.project3.server.model.Order;
import com.project3.server.service.KitchenService;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

/**
* This is a controller that handles API report requests in the Sales & Trends page 
* @author Anisha Menezes
*/
@RestController
@RequestMapping("/api")
public class KitchenController {

    private final KitchenService kitchenService;

    public KitchenController(KitchenService kitchenService) {
        this.kitchenService = kitchenService;
    }

    @GetMapping("/orders/active")
    public List<Order> getActiveOrders() {
        return kitchenService.getActiveOrders();
    }
}