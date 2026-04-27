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

    @Value("${spring.datasource.url}")
    private String dbUrl;

    @Value("${spring.datasource.username}")
    private String dbUser;

    @Value("${spring.datasource.password}")
    private String dbPassword;

    public List<MenuItem> getDrinks() throws Exception{
        String sql = "SELECT name, price, category FROM menu_items WHERE category NOT IN ('ice', 'sweetness', 'toppings')";

        try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPassword);
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {

            List<MenuItem> drinks = new ArrayList<>();

            while (rs.next()) {
                drinks.add(new MenuItem(
                        rs.getString("name"),
                        rs.getDouble("price"),
                        rs.getString("category")
                ));
            }

            return drinks;
        }
    }

    public List<MenuItem> getToppings() throws Exception{
        String sql = "SELECT name, price, category FROM menu_items WHERE category = 'toppings'";

        try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPassword);
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {

            List<MenuItem> toppings = new ArrayList<>();

            while (rs.next()) {
                toppings.add(new MenuItem(
                        rs.getString("name"),
                        rs.getDouble("price"),
                        rs.getString("category")
                ));
            }

            return toppings;
        }
    }

    public MenuItem getRandomMenuItem() throws Exception {
        String sql = "SELECT name, price, category, image_url FROM menu_items WHERE image_url IS NOT NULL AND image_url != '' AND category NOT IN ('ice', 'sweetness', 'toppings') ORDER BY RANDOM() LIMIT 1";
        try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPassword);
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
        
            MenuItem item = null;
            
            if (rs.next()) {
                item = new MenuItem(
                    rs.getString("name"),
                    rs.getDouble("price"),
                    rs.getString("category"),
                    rs.getString("image_url")
                );
            }
            
            return item;
        }
    }
}