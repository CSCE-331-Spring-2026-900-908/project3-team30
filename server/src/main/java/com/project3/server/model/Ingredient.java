package com.project3.server.model;

public class Ingredient {
    private String sku;
    private String name;
    private double retail_price;
    private String category;
    private double amt_in_stock;
    private String unit_measurement;
    private double min_stock_needed;

    // Constructors
    public Ingredient() {
    }

    public Ingredient(String sku, String name, double retail_price, String category, 
                     double amt_in_stock, String unit_measurement, double min_stock_needed) {
        this.sku = sku;
        this.name = name;
        this.retail_price = retail_price;
        this.category = category;
        this.amt_in_stock = amt_in_stock;
        this.unit_measurement = unit_measurement;
        this.min_stock_needed = min_stock_needed;
    }

    // Getters
    public String getSku() {
        return sku;
    }

    public String getName() {
        return name;
    }

    public double getRetailPrice() {
        return retail_price;
    }

    public String getCategory() {
        return category;
    }

    public double getAmtInStock() {
        return amt_in_stock;
    }

    public String getUnitMeasurement() {
        return unit_measurement;
    }

    public double getMinStockNeeded() {
        return min_stock_needed;
    }

    // Setters
    public void setSku(String sku) {
        this.sku = sku;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setRetailPrice(double retail_price) {
        this.retail_price = retail_price;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public void setAmtInStock(double amt_in_stock) {
        this.amt_in_stock = amt_in_stock;
    }

    public void setUnitMeasurement(String unit_measurement) {
        this.unit_measurement = unit_measurement;
    }

    public void setMinStockNeeded(double min_stock_needed) {
        this.min_stock_needed = min_stock_needed;
    }
}
