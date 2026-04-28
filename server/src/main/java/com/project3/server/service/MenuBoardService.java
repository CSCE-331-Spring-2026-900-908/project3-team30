package com.project3.server.service;

import com.project3.server.model.MenuItem;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

@Service
public class MenuBoardService {
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
            System.err.println("Could not create image_url column; using default menu images: " + e.getMessage());
            return hasImageColumn(conn);
        }
    }

    public List<MenuItem> getDrinks() throws Exception{
        try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPassword)) {
            boolean imageColumnAvailable = ensureImageColumn(conn);
            String sql = imageColumnAvailable
                    ? "SELECT name, price, category, image_url FROM menu_items WHERE category NOT IN ('ice', 'sweetness', 'toppings')"
                    : "SELECT name, price, category FROM menu_items WHERE category NOT IN ('ice', 'sweetness', 'toppings')";

            try (PreparedStatement stmt = conn.prepareStatement(sql);
                 ResultSet rs = stmt.executeQuery()) {

                List<MenuItem> drinks = new ArrayList<>();

                while (rs.next()) {
                    drinks.add(new MenuItem(
                            rs.getString("name"),
                            rs.getDouble("price"),
                            rs.getString("category"),
                            imageColumnAvailable ? rs.getString("image_url") : DEFAULT_IMAGE_URL
                    ));
                }

                return drinks;
            }
        }
    }

    public List<MenuItem> getToppings() throws Exception{
        try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPassword)) {
            boolean imageColumnAvailable = ensureImageColumn(conn);
            String sql = imageColumnAvailable
                    ? "SELECT name, price, category, image_url FROM menu_items WHERE category = 'toppings'"
                    : "SELECT name, price, category FROM menu_items WHERE category = 'toppings'";

            try (PreparedStatement stmt = conn.prepareStatement(sql);
                 ResultSet rs = stmt.executeQuery()) {

                List<MenuItem> toppings = new ArrayList<>();

                while (rs.next()) {
                    toppings.add(new MenuItem(
                            rs.getString("name"),
                            rs.getDouble("price"),
                            rs.getString("category"),
                            imageColumnAvailable ? rs.getString("image_url") : DEFAULT_IMAGE_URL
                    ));
                }

                return toppings;
            }
        }
    }

    public MenuItem getRandomMenuItem() throws Exception {
        try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPassword)) {
            boolean imageColumnAvailable = ensureImageColumn(conn);
            String sql = imageColumnAvailable
                    ? "SELECT name, price, category, image_url FROM menu_items WHERE image_url IS NOT NULL AND image_url != '' AND category NOT IN ('ice', 'sweetness', 'toppings') ORDER BY RANDOM() LIMIT 1"
                    : "SELECT name, price, category FROM menu_items WHERE category NOT IN ('ice', 'sweetness', 'toppings') ORDER BY RANDOM() LIMIT 1";

            try (PreparedStatement stmt = conn.prepareStatement(sql);
                 ResultSet rs = stmt.executeQuery()) {
            
                MenuItem item = null;
                
                if (rs.next()) {
                    item = new MenuItem(
                        rs.getString("name"),
                        rs.getDouble("price"),
                        rs.getString("category"),
                        imageColumnAvailable ? rs.getString("image_url") : DEFAULT_IMAGE_URL
                    );
                }
                
                return item;
            }
        }
    }
}
