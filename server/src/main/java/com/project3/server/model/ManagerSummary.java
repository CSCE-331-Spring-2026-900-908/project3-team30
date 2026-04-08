package com.project3.server.model;

public class ManagerSummary {
    private int ordersToday;
    private double revenueToday;
    private String topItem;
    private int activeEmployees;

    public ManagerSummary(int ordersToday, double revenueToday, String topItem, int activeEmployees) {
        this.ordersToday = ordersToday;
        this.revenueToday = revenueToday;
        this.topItem = topItem;
        this.activeEmployees = activeEmployees;
    }

    public int getOrdersToday() {
        return ordersToday;
    }

    public double getRevenueToday() {
        return revenueToday;
    }

    public String getTopItem() {
        return topItem;
    }

    public int getActiveEmployees() {
        return activeEmployees;
    }
}