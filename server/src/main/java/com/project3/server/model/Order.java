package com.project3.server.model;

import java.util.ArrayList;
import java.util.List;
import java.sql.Timestamp;


/**
 * This is a model class that represents an order with multiple drinks
 * @author Anisha Menezes
 */
public class Order {
    private Timestamp order_time;
    private int order_num;
    private boolean complete; 
    private List<Drink> items = new ArrayList<>();

    /**
     * Gets the order number
     * @return int for order number
     */
    public int getOrderNum() {
        return order_num;
    }

    /**
     * Gets the order time
     * @return timestamp for order time
     */
    public Timestamp getOrderTime() {
        return order_time;
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
    public void setComplete(boolean comp) {
        complete = comp;
    }

    /**
     * Sets the order_num
     * @param num order number to be set
     */
    public void setOrderNum(int num) {
        order_num = num;
    }

    /**
     * Sets the timestamp
     * @param time order time to be set
     */
    public void setTimestamp(Timestamp time) {
        order_time = time;
    }

    /**
     * Returns the drink list
     * @param drinks Drink array list to be set
     */
    public void setDrinks(List<Drink> drinks) {
        items = drinks;
    }

    /**
     * Returns the drink list
     * @return drinks arraylist associated with this order
     */
    public List<Drink> getDrinks() {
        return items;
    }


}

