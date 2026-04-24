package com.project3.server.service;

import com.project3.server.model.MenuItem;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

@Service
public class ManageMenuService {
    
    @Value("${spring.datasource.url}")
    private String dbUrl;

    @Value("${spring.datasource.username}")
    private String dbUser;

    @Value("${spring.datasource.password}")
    private String dbPassword;

    public MenuItem saveMenuItem(MenuItem item) throws Exception {
        // Check if item exists
        String checkSql = "SELECT name FROM menu_items WHERE name = ?";
        String insertSql = "INSERT INTO menu_items (name, price, category, image_url) VALUES (?, ?, ?, https://food.fnr.sndimg.com/content/dam/images/food/fullset/2023/6/13/boba-milk-tea.jpg.rend.hgtvcom.1280.1280.85.suffix/1686684207354.webp)";
        String updateSql = "UPDATE menu_items SET price = ?, category = ? WHERE name = ?";
        
        try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPassword)) {
            
            // Check if exists
            try (PreparedStatement checkStmt = conn.prepareStatement(checkSql)) {
                checkStmt.setString(1, item.getName());
                ResultSet rs = checkStmt.executeQuery();
                
                if (rs.next()) {
                    // Update existing item
                    try (PreparedStatement updateStmt = conn.prepareStatement(updateSql)) {
                        updateStmt.setDouble(1, item.getPrice());
                        updateStmt.setString(2, item.getCategory());
                        updateStmt.setString(3, item.getName());
                        updateStmt.executeUpdate();
                    }
                } else {
                    // Insert new item
                    try (PreparedStatement insertStmt = conn.prepareStatement(insertSql)) {
                        insertStmt.setString(1, item.getName());
                        insertStmt.setDouble(2, item.getPrice());
                        insertStmt.setString(3, item.getCategory());
                        insertStmt.executeUpdate();
                    }
                }
            }
            
            return item;
        }
    }
    
    public void deleteMenuItem(String name) throws Exception {
        String sql = "DELETE FROM menu_items WHERE name = ?";
        
        try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPassword);
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, name);
            int rowsAffected = stmt.executeUpdate();
            
            if (rowsAffected == 0) {
                throw new Exception("Menu item not found: " + name);
            }
        }
    }
}