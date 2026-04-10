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

    public List<String> getCategories() throws Exception{
        String sql = "SELECT category FROM menu_items WHERE category NOT IN ('ice', 'sweetness', 'toppings')";
        
        try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPassword);
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            
            List<String> categories = new ArrayList<>();

            while (rs.next()){
                String category = rs.getString("category");
                if(!(categories.contains(category))){
                    categories.add(category);
                }
            }

            return categories;
        }
    }

    public List<MenuItem> getCategoryItems(String category) throws Exception{
        String sql = "SELECT name, price FROM menu_items WHERE category = '" + category + "'";

        try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPassword);
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {

            List<MenuItem> items = new ArrayList<>();

            while (rs.next()) {
                items.add(new MenuItem(
                        rs.getString("name"),
                        rs.getDouble("price"),
                        category
                ));
            }

            return items;
        }
    }
}