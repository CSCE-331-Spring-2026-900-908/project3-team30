package com.project3.server.controller;

import com.project3.server.model.InventoryItem;
import com.project3.server.service.InventoryService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping("/inventory")
    public List<InventoryItem> getInventory() throws Exception {
        return inventoryService.getInventory();
    }

    @PostMapping("/inventory")
    public InventoryItem addInventoryItem(@RequestBody InventoryItem item) throws Exception {
        return inventoryService.addInventoryItem(item);
    }

    @PutMapping("/inventory")
    public InventoryItem updateInventoryItem(@RequestBody InventoryItem item) throws Exception {
        return inventoryService.updateInventoryItem(item);
    }

    @DeleteMapping("/inventory/{sku}")
    public void deleteInventoryItem(@PathVariable String sku) throws Exception {
        inventoryService.deleteInventoryItem(sku);
    }
}