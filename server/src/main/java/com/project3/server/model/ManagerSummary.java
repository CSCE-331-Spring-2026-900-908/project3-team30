package com.project3.server.model;

/**
 * This is a model class that represents a manager summary, which includes the necessary fields for the summary
 * @author Jade Azahar
 */
public class ManagerSummary {
    private int ordersToday;
    private double revenueToday;
    private String topItem;
    private int activeEmployees;

    /**
     * Constructor for ManagerSummary
     * @param ordersToday
     * @param revenueToday
     * @param topItem
     * @param activeEmployees
     */
    public ManagerSummary(int ordersToday, double revenueToday, String topItem, int activeEmployees) {
        this.ordersToday = ordersToday;
        this.revenueToday = revenueToday;
        this.topItem = topItem;
        this.activeEmployees = activeEmployees;
    }

    /**
     * Getters for ManagerSummary fields
     * @return int for number of orders today, double for revenue today, string for top item sold, int for number of active employees
     */
    public int getOrdersToday() {
        return ordersToday;
    }

    /**
     * Getters for ManagerSummary fields
     * @return double for revenue today
     */
    public double getRevenueToday() {
        return revenueToday;
    }

    /**
     * Getters for ManagerSummary fields
     * @return string for top item sold
     */
    public String getTopItem() {
        return topItem;
    }

    /**
     * Getters for ManagerSummary fields
     * @return int for number of active employees
     */
    public int getActiveEmployees() {
        return activeEmployees;
    }
}