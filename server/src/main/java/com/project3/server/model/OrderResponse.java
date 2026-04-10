package com.project3.server.model;

/**
 * Response returned to the frontend after an order is processed or cancelled.
 * @author Rylee Hunt
 */
public class OrderResponse {

    private int confirmationNumber;
    private String paymentMethod;
    private double total;
    private String message;

    public OrderResponse() {
    }

    public OrderResponse(int confirmationNumber, String paymentMethod, double total, String message) {
        this.confirmationNumber = confirmationNumber;
        this.paymentMethod = paymentMethod;
        this.total = total;
        this.message = message;
    }

    public int getConfirmationNumber() {
        return confirmationNumber;
    }

    public void setConfirmationNumber(int confirmationNumber) {
        this.confirmationNumber = confirmationNumber;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public double getTotal() {
        return total;
    }

    public void setTotal(double total) {
        this.total = total;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}