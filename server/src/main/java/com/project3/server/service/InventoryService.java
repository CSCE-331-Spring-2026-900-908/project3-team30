package com.project3.server.service;

import com.project3.server.model.InventoryItem;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

@Service
public class InventoryService {

    @Value("${spring.datasource.url}")
    private String dbUrl;

    @Value("${spring.datasource.username}")
    private String dbUser;

    @Value("${spring.datasource.password}")
    private String dbPassword;

    public List<InventoryItem> getInventory() throws Exception {
        String sql = """
                SELECT
                    sku,
                    name,
                    retail_price,
                    category,
                    amt_in_stock,
                    min_stock_needed,
                    unit_of_measurement
                FROM ingredients_alterations
                ORDER BY name
                """;

        try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPassword);
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            List<InventoryItem> items = new ArrayList<>();

            while (rs.next()) {
                items.add(new InventoryItem(
                        rs.getString("sku"),
                        rs.getString("name"),
                        rs.getDouble("retail_price"),
                        rs.getString("category"),
                        rs.getDouble("amt_in_stock"),
                        rs.getDouble("min_stock_needed"),
                        rs.getString("unit_of_measurement")
                ));
            }

            return items;
        }
    }

    public InventoryItem addInventoryItem(InventoryItem item) throws Exception {
        validate(item, true);

        String sql = """
                INSERT INTO ingredients_alterations
                    (sku, name, retail_price, category, amt_in_stock, min_stock_needed, unit_of_measurement)
                VALUES
                    (?, ?, ?, ?, ?, ?, ?)
                """;

        try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPassword);
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, item.getSku().trim());
            ps.setString(2, item.getName().trim());
            ps.setDouble(3, item.getRetailPrice());
            ps.setString(4, item.getCategory().trim());
            ps.setDouble(5, item.getAmtInStock());
            ps.setDouble(6, item.getMinStockNeeded());
            ps.setString(7, item.getUnitOfMeasurement().trim());

            ps.executeUpdate();
            return item;
        }
    }

    public InventoryItem updateInventoryItem(InventoryItem item) throws Exception {
        validate(item, true);

        String sql = """
                UPDATE ingredients_alterations
                SET
                    name = ?,
                    retail_price = ?,
                    category = ?,
                    amt_in_stock = ?,
                    min_stock_needed = ?,
                    unit_of_measurement = ?
                WHERE sku = ?
                """;

        try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPassword);
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, item.getName().trim());
            ps.setDouble(2, item.getRetailPrice());
            ps.setString(3, item.getCategory().trim());
            ps.setDouble(4, item.getAmtInStock());
            ps.setDouble(5, item.getMinStockNeeded());
            ps.setString(6, item.getUnitOfMeasurement().trim());
            ps.setString(7, item.getSku().trim());

            int updated = ps.executeUpdate();

            if (updated == 0) {
                throw new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No inventory item found with SKU " + item.getSku()
                );
            }

            return item;
        }
    }

    public void deleteInventoryItem(String sku) throws Exception {
        if (sku == null || sku.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "SKU is required.");
        }

        String sql = "DELETE FROM ingredients_alterations WHERE sku = ?";

        try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPassword);
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, sku.trim());

            int deleted = ps.executeUpdate();

            if (deleted == 0) {
                throw new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No inventory item found with SKU " + sku
                );
            }
        }
    }

    private void validate(InventoryItem item, boolean requireSku) {
        if (item == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Inventory item is required.");
        }

        if (requireSku && (item.getSku() == null || item.getSku().trim().isEmpty())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "SKU is required.");
        }

        if (item.getName() == null || item.getName().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Name is required.");
        }

        if (item.getCategory() == null || item.getCategory().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category is required.");
        }

        if (item.getUnitOfMeasurement() == null || item.getUnitOfMeasurement().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unit of measurement is required.");
        }

        if (item.getRetailPrice() < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Retail price cannot be negative.");
        }

        if (item.getAmtInStock() < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Amount in stock cannot be negative.");
        }

        if (item.getMinStockNeeded() < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Minimum stock needed cannot be negative.");
        }
    }
}