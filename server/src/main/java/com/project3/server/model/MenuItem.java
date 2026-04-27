package com.project3.server.model;

import java.util.ArrayList;
import java.util.List;

public class MenuItem {
    private String name;
    private double price;
    private String category;
    private String imageURL;
    private List<MenuItemIngredient> ingredients = new ArrayList<>();

    public MenuItem(String name, double price, String category){
        this.name = name;
        this.price = price;
        this.category = category;
        this.imageURL = "";
    }
    
    public MenuItem(String name, double price, String category, String imageURL){
        this.name = name;
        this.price = price;
        this.category = category;
        this.imageURL = imageURL;
    }

    public String getName(){
        return name;
    }

    public void setName(String name){
        this.name = name;
    }

    public double getPrice(){
        return price;
    }

    public void setPrice(double price){
        this.price = price;
    }

    public String getCategory(){
        return category;
    }

    public void setCategory(String category){
        this.category = category;
    }

    public String getImageURL(){
        return imageURL;
    }

    public void setImageURL(String itemURL){
        this.imageURL = itemURL;
    }

    public List<MenuItemIngredient> getIngredients(){
        return ingredients;
    }

    public void addIngredient(InventoryItem ingredient, double quantity) {
        this.ingredients.add(new MenuItemIngredient(ingredient, quantity));
    }

    public void editIngredient(InventoryItem ingredient, double quantity) {
        for (int i = 0; i < this.ingredients.size(); i++) {
            if (this.ingredients.get(i).getIngredient().equals(ingredient)) {
                this.ingredients.get(i).setQuantity(quantity);
                break; // Stop after editing the first match
            }
        }
    }
    
    public void removeIngredient(InventoryItem ingredient) {
        for (int i = 0; i < this.ingredients.size(); i++) {
            if (this.ingredients.get(i).getIngredient().equals(ingredient)) {
                this.ingredients.remove(i);
                break; // Stop after removing the first match
            }
        }
    }
}
