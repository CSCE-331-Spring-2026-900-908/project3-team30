package com.project3.server.service;

import com.project3.server.model.AlterationOptionsResponse;
import com.project3.server.model.Modification;
import org.springframework.stereotype.Service;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;
import javax.sql.DataSource;

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
    private final DataSource dataSource;

    public ModificationService(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public AlterationOptionsResponse getAlterations() throws Exception {
        try (Connection conn = dataSource.getConnection()) {
            ensureHotIceOption(conn);
            return new AlterationOptionsResponse(
                    loadByCategory(conn, "toppings", false),
                    loadByCategory(conn, "sweetness", false),
                    loadByCategory(conn, "ice", true)
            );
        }
    }

    private void ensureHotIceOption(Connection conn) throws Exception {
        String checkSql = "SELECT 1 FROM menu_items WHERE LOWER(name) = 'hot' AND category = 'ice' LIMIT 1";
        try (PreparedStatement checkStmt = conn.prepareStatement(checkSql);
             ResultSet rs = checkStmt.executeQuery()) {
            if (rs.next()) {
                return;
            }
        }

        String insertSql = "INSERT INTO menu_items (name, price, category) VALUES ('Hot', 0, 'ice')";
        try (PreparedStatement insertStmt = conn.prepareStatement(insertSql)) {
            insertStmt.executeUpdate();
        }
    }

    /**
     * Loads modifications from menu_items for one category.
     *
     * For ice percentages, numeric sorting is used for percent-based values, while
     * non-percent options like Hot are still allowed and will not crash the query.
     */
    private List<Modification> loadByCategory(Connection conn, String category, boolean sortPercent) throws Exception {
        String sql = sortPercent
                ? """
                    SELECT name, price
                    FROM menu_items
                    WHERE category = ?
                    ORDER BY
                        CASE WHEN LOWER(name) = 'hot' THEN 0 ELSE 1 END,
                        CASE WHEN name ~ '^[0-9]+%' THEN 0 ELSE 1 END,
                        CASE WHEN name ~ '^[0-9]+%' THEN CAST(SPLIT_PART(name, '%', 1) AS INTEGER) ELSE 999 END,
                        name
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
