package com.project3.server.service;

import com.project3.server.model.InventoryItem;
import com.project3.server.model.MenuItemIngredient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class IngredientEditorService {
    
    @Value("${spring.datasource.url}")
    private String dbUrl;
    
    @Value("${spring.datasource.username}")
    private String dbUser;
    
    @Value("${spring.datasource.password}")
    private String dbPassword;
    
    public List<Map<String, Object>> getIngredientsForMenuItem(String menuItemName) throws Exception {
        String sql = "SELECT mti.ingredient, mti.quantity_used " +
                     "FROM menu_to_ingredients mti " +
                     "WHERE mti.menu_item = ? " +
                     "ORDER BY mti.ingredient";
        
        try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPassword);
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, menuItemName);
            ResultSet rs = stmt.executeQuery();
            
            List<Map<String, Object>> ingredients = new ArrayList<>();
            while (rs.next()) {
                Map<String, Object> ingredient = new HashMap<>();
                ingredient.put("ingredient", rs.getString("ingredient"));
                ingredient.put("quantityUsed", rs.getDouble("quantity_used"));
                ingredients.add(ingredient);
            }
            return ingredients;
        }
    }
    
    public List<InventoryItem> getAvailableIngredients() throws Exception {
        String sql = "SELECT sku, name, category, unit_of_measurement, retail_price, amt_in_stock, min_stock_needed " +
                     "FROM ingredients_alterations " +
                     "ORDER BY name";
        
        try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPassword);
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            
            List<InventoryItem> items = new ArrayList<>();
            while (rs.next()) {
                InventoryItem item = new InventoryItem(
                    rs.getString("sku"),
                    rs.getString("name"),
                    rs.getDouble("retail_price"),
                    rs.getString("category"),
                    rs.getDouble("amt_in_stock"),
                    rs.getDouble("min_stock_needed"),
                    rs.getString("unit_of_measurement")
                );
                items.add(item);
            }
            return items;
        }
    }
    
    public void saveIngredientForMenuItem(String menuItemName, String ingredientName, double quantityUsed) throws Exception {
        // Check if ingredient exists in ingredients_alterations
        String checkIngredientSql = "SELECT name FROM ingredients_alterations WHERE name = ?";
        
        try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPassword)) {
            
            try (PreparedStatement checkStmt = conn.prepareStatement(checkIngredientSql)) {
                checkStmt.setString(1, ingredientName);
                ResultSet rs = checkStmt.executeQuery();
                
                if (!rs.next()) {
                    throw new Exception("Ingredient does not exist in inventory: " + ingredientName);
                }
            }
            
            // Check if the link already exists
            String checkLinkSql = "SELECT menu_item FROM menu_to_ingredients WHERE menu_item = ? AND ingredient = ?";
            
            try (PreparedStatement checkLinkStmt = conn.prepareStatement(checkLinkSql)) {
                checkLinkStmt.setString(1, menuItemName);
                checkLinkStmt.setString(2, ingredientName);
                ResultSet rs = checkLinkStmt.executeQuery();
                
                if (rs.next()) {
                    // Update existing link
                    String updateSql = "UPDATE menu_to_ingredients SET quantity_used = ? WHERE menu_item = ? AND ingredient = ?";
                    try (PreparedStatement updateStmt = conn.prepareStatement(updateSql)) {
                        updateStmt.setDouble(1, quantityUsed);
                        updateStmt.setString(2, menuItemName);
                        updateStmt.setString(3, ingredientName);
                        updateStmt.executeUpdate();
                    }
                } else {
                    // Insert new link
                    String insertSql = "INSERT INTO menu_to_ingredients (menu_item, ingredient, quantity_used) VALUES (?, ?, ?)";
                    try (PreparedStatement insertStmt = conn.prepareStatement(insertSql)) {
                        insertStmt.setString(1, menuItemName);
                        insertStmt.setString(2, ingredientName);
                        insertStmt.setDouble(3, quantityUsed);
                        insertStmt.executeUpdate();
                    }
                }
            }
        }
    }
    
    public void deleteIngredientForMenuItem(String menuItemName, String ingredientName) throws Exception {
        String sql = "DELETE FROM menu_to_ingredients WHERE menu_item = ? AND ingredient = ?";
        
        try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPassword);
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, menuItemName);
            stmt.setString(2, ingredientName);
            int rowsAffected = stmt.executeUpdate();
            
            if (rowsAffected == 0) {
                throw new Exception("Ingredient link not found for menu item");
            }
        }
    }
}