package com.project3.server.model;

public class XReport {
    private double totalCash;
    private double totalCard;
    private double subtotal;
    private double tax;
    private double netTotal;
    private int numSales;
    private int numCancelled;
    private int numVoided;

    public XReport(double totalCash, double totalCard, double subtotal, double tax, double netTotal, int numSales, int numCancelled, int numVoided) {
        this.totalCash = totalCash;
        this.totalCard = totalCard;
        this.subtotal = subtotal;
        this.tax = tax;
        this.netTotal = netTotal;
        this.numSales = numSales;
        this.numCancelled = numCancelled;
        this.numVoided = numVoided;
    }

    public double getTotalCash() {
        return totalCash;
    }

    public double getTotalCard() {
        return totalCard;
    }

    public double getSubtotal() {
        return subtotal;
    }

    public double getTax() {
        return tax;
    }

    public double getNetTotal() {
        return netTotal;
    }

    public int getNumSales() {
        return numSales;
    }

    public int getNumCancelled() {
        return numCancelled;
    }

    public int getNumVoided() {
        return numVoided;
    }
}
