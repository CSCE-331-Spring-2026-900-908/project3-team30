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
    private static final String DEFAULT_IMAGE_URL = "/images/1686684207354.webp";
    
    @Value("${spring.datasource.url}")
    private String dbUrl;

    @Value("${spring.datasource.username}")
    private String dbUser;

    @Value("${spring.datasource.password}")
    private String dbPassword;

    private boolean hasImageColumn(Connection conn) {
        String sql = """
                SELECT 1
                FROM information_schema.columns
                WHERE table_name = 'menu_items'
                  AND column_name = 'image_url'
                LIMIT 1
                """;
        try (PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            return rs.next();
        } catch (Exception e) {
            System.err.println("Could not check image_url column: " + e.getMessage());
            return false;
        }
    }

    private boolean ensureImageColumn(Connection conn) {
        try (PreparedStatement ps = conn.prepareStatement("ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS image_url TEXT")) {
            ps.executeUpdate();
            return true;
        } catch (Exception e) {
            System.err.println("Could not create image_url column; continuing without menu images: " + e.getMessage());
            return hasImageColumn(conn);
        }
    }

    private String cleanImageUrl(String imageUrl) {
        return imageUrl == null || imageUrl.trim().isEmpty() ? DEFAULT_IMAGE_URL : imageUrl.trim();
    }

    public MenuItem saveMenuItem(MenuItem item) throws Exception {
        try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPassword)) {
            boolean imageColumnAvailable = ensureImageColumn(conn);
            String imageUrl = cleanImageUrl(item.getImageURL());
            item.setImageURL(imageUrl);

            String checkSql = "SELECT name FROM menu_items WHERE name = ?";
            String insertSql = imageColumnAvailable
                    ? "INSERT INTO menu_items (name, price, category, image_url) VALUES (?, ?, ?, ?)"
                    : "INSERT INTO menu_items (name, price, category) VALUES (?, ?, ?)";
            String updateSql = imageColumnAvailable
                    ? "UPDATE menu_items SET price = ?, category = ?, image_url = ? WHERE name = ?"
                    : "UPDATE menu_items SET price = ?, category = ? WHERE name = ?";
            
            try (PreparedStatement checkStmt = conn.prepareStatement(checkSql)) {
                checkStmt.setString(1, item.getName());
                ResultSet rs = checkStmt.executeQuery();
                
                if (rs.next()) {
                    try (PreparedStatement updateStmt = conn.prepareStatement(updateSql)) {
                        updateStmt.setDouble(1, item.getPrice());
                        updateStmt.setString(2, item.getCategory());
                        if (imageColumnAvailable) {
                            updateStmt.setString(3, imageUrl);
                            updateStmt.setString(4, item.getName());
                        } else {
                            updateStmt.setString(3, item.getName());
                        }
                        updateStmt.executeUpdate();
                    }
                } else {
                    try (PreparedStatement insertStmt = conn.prepareStatement(insertSql)) {
                        insertStmt.setString(1, item.getName());
                        insertStmt.setDouble(2, item.getPrice());
                        insertStmt.setString(3, item.getCategory());
                        if (imageColumnAvailable) {
                            insertStmt.setString(4, imageUrl);
                        }
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
