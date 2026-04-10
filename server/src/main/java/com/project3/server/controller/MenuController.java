package com.project3.server.controller;

import com.project3.server.model.Drink;
import com.project3.server.service.MenuService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Exposes menu item data to the frontend.
 * @author Rylee Hunt
 */
@RestController
@RequestMapping("/api")
public class MenuController {

    private final MenuService menuService;

    public MenuController(MenuService menuService) {
        this.menuService = menuService;
    }

    /**
     * GET /api/menu-items
     *
     * Returns all menu items that should be shown on the cashier/customer menu page.
     */
    @GetMapping("/menu-items")
    public List<Drink> getMenuItems() throws Exception {
        return menuService.getMenuItems();
    }
}