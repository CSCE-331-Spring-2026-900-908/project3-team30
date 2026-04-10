package com.project3.server.model;

/**
 * Represents a modification to be added to a Drink
 * @author Nitya Khurana
 */
public class Modification {

    private String name;
    private double price;
    
    /**
     * Creates a Modification
     * @param name
     * @param price
     */
    public Modification(String name, double price) {
        this.name = name;
        this.price = price;
    }

    /**
     * Gets the name of this modification
     * @return Modification name
     */
    public String getName() { return name; }

    /**
     * Sets the modification name.
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * Gets the price of this modification
     * @return Modfication additional price
     */
    public double getPrice() { return price; }

    /**
     * Sets the modification price.
     */
    public void setPrice(double price) {
        this.price = price;
    }

    @Override
    public String toString() {
        return name;
    }
}

