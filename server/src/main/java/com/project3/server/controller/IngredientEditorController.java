package com.project3.server.controller;

import com.project3.server.model.InventoryItem;
import com.project3.server.service.IngredientEditorService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class IngredientEditorController {
    
    private final IngredientEditorService ingredientEditorService;
    
    public IngredientEditorController(IngredientEditorService ingredientEditorService) {
        this.ingredientEditorService = ingredientEditorService;
    }
    
    @GetMapping("/menu-drinks/{menuItemName}/ingredients")
    public List<Map<String, Object>> getIngredientsForMenuItem(@PathVariable String menuItemName) throws Exception {
        return ingredientEditorService.getIngredientsForMenuItem(menuItemName);
    }
    
    @GetMapping("/available-ingredients")
    public List<InventoryItem> getAvailableIngredients() throws Exception {
        return ingredientEditorService.getAvailableIngredients();
    }
    
    @PostMapping("/menu-drinks/{menuItemName}/ingredients")
    public void saveIngredientForMenuItem(
            @PathVariable String menuItemName,
            @RequestBody Map<String, Object> body) throws Exception {
        
        String ingredientName = (String) body.get("ingredient");
        double quantityUsed = 0.0;
        Object quantityObj = body.get("quantityUsed");
        if (quantityObj instanceof Number) {
            quantityUsed = ((Number) quantityObj).doubleValue();
        } else if (quantityObj instanceof String) {
            quantityUsed = Double.parseDouble((String) quantityObj);
        } else if (quantityObj == null) {
            throw new IllegalArgumentException("Quantity used is required");
        }
        
        if (ingredientName == null || ingredientName.isEmpty()) {
            throw new IllegalArgumentException("Ingredient name is required");
        }
        
        ingredientEditorService.saveIngredientForMenuItem(menuItemName, ingredientName, quantityUsed);
    }
    
    @DeleteMapping("/menu-drinks/{menuItemName}/ingredients/{ingredientName}")
    public void deleteIngredientForMenuItem(
            @PathVariable String menuItemName,
            @PathVariable String ingredientName) throws Exception {
        
        ingredientEditorService.deleteIngredientForMenuItem(menuItemName, ingredientName);
    }
}