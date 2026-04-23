package com.project3.server.model;

public class MenuItemIngredient {
    private InventoryItem ingredient;
    private double quantity;
    
    public MenuItemIngredient() {
    }
    
    public MenuItemIngredient(InventoryItem ingredient, double quantity) {
        this.ingredient = ingredient;
        this.quantity = quantity;
    }
    
    // Getters and Setters
    public InventoryItem getIngredient() {
        return ingredient;
    }
    
    public void setIngredient(InventoryItem ingredient) {
        this.ingredient = ingredient;
    }
    
    public double getQuantity() {
        return quantity;
    }
    
    public void setQuantity(double quantity) {
        this.quantity = quantity;
    }
}