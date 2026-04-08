package com.project3.server.model;

public class SalesReport {
    private String item;
    private int quantitySold;
    private double revenue;

    public SalesReport(String item, int quantitySold, double revenue) {
        this.item = item;
        this.quantitySold = quantitySold;
        this.revenue = revenue;
    }

    public String getItem() {
        return item;
    }

    public int getQuantitySold() {
        return quantitySold;
    }

    public double getRevenue() {
        return revenue;
    }
}
