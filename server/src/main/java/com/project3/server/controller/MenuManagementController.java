package com.project3.server.controller;

import com.project3.server.model.MenuItem;
import com.project3.server.service.ManageMenuService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class MenuManagementController {
    
    private final ManageMenuService manageMenuService;
    
    public MenuManagementController(ManageMenuService manageMenuService) {
        this.manageMenuService = manageMenuService;
    }
    
    @PostMapping("/menu-drinks")
    public MenuItem saveMenuItem(@RequestBody MenuItem item) throws Exception {
        return manageMenuService.saveMenuItem(item);
    }
    
    @DeleteMapping("/menu-drinks/{name}")
    public void deleteMenuItem(@PathVariable String name) throws Exception {
        manageMenuService.deleteMenuItem(name);
    }
}