package com.project3.server.model;

import java.util.ArrayList;
import java.util.List;

/**
 * Represents the current cart to be checked out or cancelled.
 * @author Jade Azahar
 */
public class Cart {
    public static final List<Drink> items = new ArrayList<>();
    public static void clear() { items.clear(); }
}
