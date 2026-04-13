package com.project3.server.model;

public class MenuItemIngredient {
    private Ingredient ingredient;
    private double quantity;
    
    public MenuItemIngredient() {
    }
    
    public MenuItemIngredient(Ingredient ingredient, double quantity) {
        this.ingredient = ingredient;
        this.quantity = quantity;
    }
    
    // Getters and Setters
    public Ingredient getIngredient() {
        return ingredient;
    }
    
    public void setIngredient(Ingredient ingredient) {
        this.ingredient = ingredient;
    }
    
    public double getQuantity() {
        return quantity;
    }
    
    public void setQuantity(double quantity) {
        this.quantity = quantity;
    }
}
