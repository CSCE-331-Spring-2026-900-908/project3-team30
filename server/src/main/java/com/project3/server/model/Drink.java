package com.project3.server.model;

import java.util.ArrayList;
import java.util.List;

/**
 * Represents a drink to be added to the cart.
 * @author Nitya Khurana and Anisha Menezes
 */
public class Drink {

    private String name;
    private double basePrice;
    private boolean complete;
    private List<Modification> modifications = new ArrayList<>();

    /**
     * Creates a drink with a name and price
     * @param name
     * @param basePrice
     */
    public Drink(String name, double basePrice) {
        this.name = name;
        this.basePrice = basePrice;
    }

    /**
     * Adds a mofidication to this Drink's list of modifications
     * @param mod
     */
    public void addModification(Modification mod) {
        modifications.add(mod);
    }


    /**
     * Gets this Drink's modifications
     * @return modifications list for this Drink
     */
    public List<Modification> getModifications() {
        return modifications;
    }

    /**
     * Gets the total price for this Drink
     * @return total price
     */
    public double getTotalPrice() {
        double total = basePrice;
        for (Modification m : modifications) {
            total += m.getPrice();
        }
        return total;
    }

    /**
     * Gets the name of this Drink
     * @return Drink name
     */
    public String getName() {
        return name;
    }

    /**
     * Gets if the order is complete
     * @return boolean for if the order has been completed
     */
    public boolean getComplete() {
        return complete;
    }

    /**
     * Sets if the order is complete
     * @param comp Boolean for if the order is complete
     */
    public void getComplete(boolean comp) {
        complete = comp;
    }
}
