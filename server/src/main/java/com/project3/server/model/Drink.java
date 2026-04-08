package com.project3.server.model;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

/**
 * Represents a drink to be added to the cart.
 * @author Nitya Khurana
 */
public class Drink {

    private String name;
    private double basePrice;
    private List<Modification> modifications = new ArrayList<>();
    private String image;
    /**
     * Creates a drink with a name and price
     * @param name
     * @param basePrice
     * @param image
     */
    public Drink(String name, double basePrice, String image) {
        this.name = name;
        this.basePrice = basePrice;
        this.image = image;
    }

    /**
     * Adds a modification to this Drink's list of modifications
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
     * Allows frontend JSON to set the modifications list.
     */
    public void setModifications(List<Modification> modifications) {
        this.modifications = modifications != null ? modifications : new ArrayList<>();
    }

    /**
     * Returns the image file path
     * @return
     */
    public String getImage(){
        return image;
    }

    /**
     * Allows backend/frontend JSON mapping to set image.
     */
    public void setImage(String image) {
        this.image = image;
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
     * Gets the price of this Drink
     * @return Drink price
     */
    public double getBasePrice() {
        return basePrice;
    }
    public double getPrice() {
        return basePrice;
    }

     /**
     * Allows frontend JSON to set base price.
     */
    public void setBasePrice(double basePrice) {
        this.basePrice = basePrice;
    }

    /**
     * Allows frontend JSON to set name.
     */
    public void setName(String name) {
        this.name = name;
    }

}
