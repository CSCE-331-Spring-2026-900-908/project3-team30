package com.project3.server.model;

/**
 * This is a model class that represents an X report, which includes the necessary fields for the X report
 * @author Jade Azahar
 */
public class XReport {
    private double totalCash;
    private double totalCard;
    private double subtotal;
    private double tax;
    private double netTotal;
    private int numSales;
    private int numCancelled;
    private int numVoided;

    /**
     * Constructor for XReport
     * @param totalCash
     * @param totalCard
     * @param subtotal
     * @param tax
     * @param netTotal
     * @param numSales
     * @param numCancelled
     * @param numVoided
     */
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

    /**
     * Getters for XReport fields
     * @return double for cash, card, etc.
     */
    public double getTotalCash() {
        return totalCash;
    }

    /**
     * Getters for XReport fields
     * @return double for card sales
     */
    public double getTotalCard() {
        return totalCard;
    }

    /**
     * Getters for XReport fields
     * @return double for subtotal of cash and card sales
     */
    public double getSubtotal() {
        return subtotal;
    }

    /**
     * Getters for XReport fields
     * @return double for tax amount
     */
    public double getTax() {
        return tax;
    }

    /**
     * Getters for XReport fields
     * @return double for net total (subtotal + tax)
     */
    public double getNetTotal() {
        return netTotal;
    }

    /**
     * Getters for XReport fields
     * @return int for number of sales, cancelled transactions, voided transactions
     */
    public int getNumSales() {
        return numSales;
    }

    /**
     * Getters for XReport fields
     * @return int for number of cancelled transactions
     */
    public int getNumCancelled() {
        return numCancelled;
    }

    /**
     * Getters for XReport fields
     * @return int for number of voided transactions
     */ 
    public int getNumVoided() {
        return numVoided;
    }
}
