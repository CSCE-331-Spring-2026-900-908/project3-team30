// String sqlStatement =
//             "SELECT name, price, image FROM menu_items " +
//             "WHERE category NOT IN ('ice', 'sweetness', 'toppings') " +
//             "ORDER BY name";
// ResultSet rs = stmt.executeQuery(sqlStatement);
package com.project3.server.service;

import com.project3.server.model.Drink;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

/**
 * Loads cashier/customer menu items from the database.
 * @author Rylee Hunt
 */
@Service
public class MenuService {

    @Value("${spring.datasource.url}")
    private String dbUrl;

    @Value("${spring.datasource.username}")
    private String dbUser;

    @Value("${spring.datasource.password}")
    private String dbPassword;

    /**
     * Returns all main menu items.
     *
     * Exclude ice/sweetness/toppings because those are modifications.
     */
    public List<Drink> getMenuItems() throws Exception {
        String sql = """
                SELECT name, price, image_url
                FROM menu_items
                WHERE category NOT IN ('ice', 'sweetness', 'toppings')
                ORDER BY name
                """;

        try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPassword);
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {

            List<Drink> items = new ArrayList<>();

            while (rs.next()) {
                items.add(new Drink(
                        rs.getString("name"),
                        rs.getDouble("price"),
                        rs.getString("image_url")
                ));
            }

            return items;
        }
    }
}