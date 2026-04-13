package com.project3.server.service;

import com.project3.server.model.AlterationOptionsResponse;
import com.project3.server.model.Modification;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

/**
 * Loads modification choices from the database.
 *
 * This includes:
 * - toppings/default modifications
 * - sweetness
 * - ice
 * 
 * @author Rylee Hunt
 */
@Service
public class ModificationService {

    @Value("${spring.datasource.url}")
    private String dbUrl;

    @Value("${spring.datasource.username}")
    private String dbUser;

    @Value("${spring.datasource.password}")
    private String dbPassword;

    public AlterationOptionsResponse getAlterations() throws Exception {
        try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPassword)) {
            return new AlterationOptionsResponse(
                    loadByCategory(conn, "toppings", false),
                    loadByCategory(conn, "sweetness", false),
                    loadByCategory(conn, "ice", true)
            );
        }
    }

    /**
     * Loads modifications from menu_items for one category.
     *
     * For ice percentages, numeric sorting is used so things like
     * 0%, 25%, 50%, 100% stay in the expected order.
     */
    private List<Modification> loadByCategory(Connection conn, String category, boolean sortPercent) throws Exception {
        String sql = sortPercent
                ? """
                    SELECT name, price
                    FROM menu_items
                    WHERE category = ?
                    ORDER BY CAST(SPLIT_PART(name, '%', 1) AS INTEGER)
                    """
                : """
                    SELECT name, price
                    FROM menu_items
                    WHERE category = ?
                    ORDER BY name
                    """;

        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, category);

            try (ResultSet rs = stmt.executeQuery()) {
                List<Modification> modifications = new ArrayList<>();

                while (rs.next()) {
                    modifications.add(new Modification(
                            rs.getString("name"),
                            rs.getDouble("price")
                    ));
                }

                return modifications;
            }
        }
    }
}