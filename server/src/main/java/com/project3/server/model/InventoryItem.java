package com.project3.server.model;

public class InventoryItem {
    private String sku;
    private String name;
    private double retailPrice;
    private String category;
    private double amtInStock;
    private double minStockNeeded;
    private String unitOfMeasurement;

    public InventoryItem() {
    }

    public InventoryItem(
            String sku,
            String name,
            double retailPrice,
            String category,
            double amtInStock,
            double minStockNeeded,
            String unitOfMeasurement
    ) {
        this.sku = sku;
        this.name = name;
        this.retailPrice = retailPrice;
        this.category = category;
        this.amtInStock = amtInStock;
        this.minStockNeeded = minStockNeeded;
        this.unitOfMeasurement = unitOfMeasurement;
    }

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public String getName() {
        return name;
    }

    public double getRetailPrice() {
        return retailPrice;
    }

    public void setRetailPrice(double retailPrice) {
        this.retailPrice = retailPrice;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public double getAmtInStock() {
        return amtInStock;
    }

    public void setAmtInStock(double amtInStock) {
        this.amtInStock = amtInStock;
    }

    public double getMinStockNeeded() {
        return minStockNeeded;
    }

    public void setMinStockNeeded(double minStockNeeded) {
        this.minStockNeeded = minStockNeeded;
    }

    public String getUnitOfMeasurement() {
        return unitOfMeasurement;
    }

    public void setUnitOfMeasurement(String unitOfMeasurement) {
        this.unitOfMeasurement = unitOfMeasurement;
    }
}