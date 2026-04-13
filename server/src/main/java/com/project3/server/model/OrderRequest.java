package com.project3.server.model;

import java.util.ArrayList;
import java.util.List;

/**
 * Represents an order request sent from the frontend to the backend.
 */
public class OrderRequest {

    private String paymentMethod;
    private double total;
    private String orderNotes;
    private List<Drink> items = new ArrayList<>();

    public OrderRequest() {
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

    public String getOrderNotes() {
        return orderNotes;
    }

    public void setOrderNotes(String orderNotes) {
        this.orderNotes = orderNotes;
    }

    public List<Drink> getItems() {
        return items;
    }

    public void setItems(List<Drink> items) {
        this.items = items != null ? items : new ArrayList<>();
    }
}