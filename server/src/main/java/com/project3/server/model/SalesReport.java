package com.project3.server.model;

/**
 * This is a model class that represents a sales report for a given item, including the item name, quantity sold, and revenue generated
 * @author Jade Azahar
 */
public class SalesReport {
    private String item;
    private int quantitySold;
    private double revenue;

    /**
     * Constructor for SalesReport
     * @param item
     * @param quantitySold
     * @param revenue
     */
    public SalesReport(String item, int quantitySold, double revenue) {
        this.item = item;
        this.quantitySold = quantitySold;
        this.revenue = revenue;
    }

    /**
     * Getters for SalesReport fields
     * @return string item name, int quantity sold, double revenue
     */
    public String getItem() {
        return item;
    }

    /**
     * Getters for SalesReport fields
     * @return int quantity sold
     */
    public int getQuantitySold() {
        return quantitySold;
    }

    /**
     * Getters for SalesReport fields
     * @return double revenue 
     */
    public double getRevenue() {
        return revenue;
    }
}
