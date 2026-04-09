package com.project3.server.model;
/**
 * This is a model class that represents a restock report, which includes the necessary fields for the restock report
 * @author Karla Sanchez
 */


public class RestockReport {
    private String sku;
    private String name;
    private double amtInStock;
    private double minStockNeeded;

    public RestockReport(String sku, String name, double amtInStock, double minStockNeeded) {
        this.sku = sku;
        this.name = name;
        this.amtInStock = amtInStock;
        this.minStockNeeded = minStockNeeded;
    }

    public String getSku() {
        return sku;
    }

    public String getName() {
        return name;
    }

    public double getAmtInStock() {
        return amtInStock;
    }

    public double getMinStockNeeded() {
        return minStockNeeded;
    }
}