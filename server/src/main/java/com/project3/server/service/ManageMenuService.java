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

    public MenuItem saveMenuItem(MenuItem item) throws Exception {
        validateMenuItem(item);

        try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPassword)) {
            boolean hasImageColumn = ensureImageColumnIfPossible(conn);
            boolean exists = menuItemExists(conn, item.getName());

            String imageUrl = cleanImageUrl(item.getImageURL());
            item.setImageURL(imageUrl);

            if (exists) {
                updateMenuItem(conn, item, hasImageColumn);
            } else {
                insertMenuItem(conn, item, hasImageColumn);
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

    private void validateMenuItem(MenuItem item) {
        if (item == null) {
            throw new IllegalArgumentException("Menu item is required.");
        }

        if (item.getName() == null || item.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Menu item name is required.");
        }

        if (item.getCategory() == null || item.getCategory().trim().isEmpty()) {
            throw new IllegalArgumentException("Menu item category is required.");
        }

        if (item.getPrice() < 0) {
            throw new IllegalArgumentException("Menu item price cannot be negative.");
        }

        item.setName(item.getName().trim());
        item.setCategory(item.getCategory().trim());
    }

    private boolean ensureImageColumnIfPossible(Connection conn) {
        try {
            String sql = "ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS image_url TEXT";
            try (PreparedStatement ps = conn.prepareStatement(sql)) {
                ps.executeUpdate();
            }
            return true;
        } catch (Exception e) {
            System.err.println("Could not ensure image_url column. Continuing without image_url. Reason: " + e.getMessage());
            return false;
        }
    }

    private boolean menuItemExists(Connection conn, String name) throws Exception {
        String sql = "SELECT name FROM menu_items WHERE name = ?";

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, name);

            try (ResultSet rs = ps.executeQuery()) {
                return rs.next();
            }
        }
    }

    private void insertMenuItem(Connection conn, MenuItem item, boolean hasImageColumn) throws Exception {
        String sql = hasImageColumn
                ? "INSERT INTO menu_items (name, price, category, image_url) VALUES (?, ?, ?, ?)"
                : "INSERT INTO menu_items (name, price, category) VALUES (?, ?, ?)";

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, item.getName());
            ps.setDouble(2, item.getPrice());
            ps.setString(3, item.getCategory());

            if (hasImageColumn) {
                ps.setString(4, cleanImageUrl(item.getImageURL()));
            }

            ps.executeUpdate();
        }
    }

    private void updateMenuItem(Connection conn, MenuItem item, boolean hasImageColumn) throws Exception {
        String sql = hasImageColumn
                ? "UPDATE menu_items SET price = ?, category = ?, image_url = ? WHERE name = ?"
                : "UPDATE menu_items SET price = ?, category = ? WHERE name = ?";

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setDouble(1, item.getPrice());
            ps.setString(2, item.getCategory());

            if (hasImageColumn) {
                ps.setString(3, cleanImageUrl(item.getImageURL()));
                ps.setString(4, item.getName());
            } else {
                ps.setString(3, item.getName());
            }

            int updated = ps.executeUpdate();

            if (updated == 0) {
                throw new Exception("Menu item not found: " + item.getName());
            }
        }
    }

    private String cleanImageUrl(String imageUrl) {
        if (imageUrl == null || imageUrl.trim().isEmpty()) {
            return DEFAULT_IMAGE_URL;
        }

        return imageUrl.trim();
    }
}