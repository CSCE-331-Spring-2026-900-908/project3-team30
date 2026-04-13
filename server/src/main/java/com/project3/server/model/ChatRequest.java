package com.project3.server.model;

import java.util.List;

public class ChatRequest {
    private String message;
    private List<Drink> menuItems;
    private AlterationOptionsResponse alterations;
    private Drink selectedItem;
    private List<Modification> selectedMods;
    private String selectedSweetness;
    private List<Drink> cart;

    public ChatRequest() {}

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public List<Drink> getMenuItems() {
        return menuItems;
    }

    public void setMenuItems(List<Drink> menuItems) {
        this.menuItems = menuItems;
    }

    public AlterationOptionsResponse getAlterations() {
        return alterations;
    }

    public void setAlterations(AlterationOptionsResponse alterations) {
        this.alterations = alterations;
    }

    public Drink getSelectedItem() {
        return selectedItem;
    }

    public void setSelectedItem(Drink selectedItem) {
        this.selectedItem = selectedItem;
    }

    public List<Modification> getSelectedMods() {
        return selectedMods;
    }

    public void setSelectedMods(List<Modification> selectedMods) {
        this.selectedMods = selectedMods;
    }

    public String getSelectedSweetness() {
        return selectedSweetness;
    }

    public void setSelectedSweetness(String selectedSweetness) {
        this.selectedSweetness = selectedSweetness;
    }

    public List<Drink> getCart() {
        return cart;
    }

    public void setCart(List<Drink> cart) {
        this.cart = cart;
    }
}