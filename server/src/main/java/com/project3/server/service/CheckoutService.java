package com.project3.server.service;

import com.project3.server.model.Drink;
import com.project3.server.model.Modification;
import com.project3.server.model.OrderRequest;
import com.project3.server.model.OrderResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Handles checkout/cancel logic for Project 3.
 *
 * This service moves the old Project 2 checkout database logic into the
 * Spring backend.
 * 
 * @author Rylee Hunt
 */
@Service
public class CheckoutService {

    @Value("${spring.datasource.url}")
    private String dbUrl;

    @Value("${spring.datasource.username}")
    private String dbUser;

    @Value("${spring.datasource.password}")
    private String dbPassword;

    /**
     * Processes a completed order:
     * - inserts row into sales
     * - inserts purchased items
     * - records ingredient usage
     * - subtracts used ingredients from inventory
     */
    public OrderResponse processOrder(OrderRequest request) throws Exception {
        validateOrder(request, true);

        try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPassword)) {
            conn.setAutoCommit(false);

            try {
                int transactionNumber = getNextId(conn, "sales", "transaction_number");
                double total = computeTotal(request.getItems());
                String paymentMethod = normalizePaymentMethod(request.getPaymentMethod());
                String orderNotes = request.getOrderNotes() == null ? "" : request.getOrderNotes();

                insertSale(conn, transactionNumber, total, orderNotes, paymentMethod);

                int nextItemId = getNextId(conn, "items_purchased", "id_number");

                for (Drink drink : request.getItems()) {

                    String modNotes = drink.getModifications().stream().map(Modification::getName).collect(Collectors.joining(", "));

                    String combinedNotes = (orderNotes != null && !orderNotes.trim().isEmpty()) ? orderNotes + ", " + modNotes : modNotes;
                    insertPurchasedItem(conn, nextItemId, transactionNumber, drink, combinedNotes);
                    insertIngredientsAndUpdateInventory(conn, drink, nextItemId, transactionNumber);
                    nextItemId++;
                }

                conn.commit();
                return new OrderResponse(transactionNumber, paymentMethod, total, "Order processed successfully");
            } catch (Exception e) {
                conn.rollback();
                throw e;
            } finally {
                conn.setAutoCommit(true);
            }
        }
    }

    /**
     * Records a cancelled order in cancelled_voided.
     */
    public OrderResponse cancelOrder(OrderRequest request) throws Exception {
        validateOrder(request, false);

        try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPassword)) {
            int transactionNumber = getNextId(conn, "cancelled_voided", "transaction_number");
            double total = computeTotal(request.getItems());
            String orderNotes = request.getOrderNotes() == null
                    ? "Cancelled from web checkout"
                    : request.getOrderNotes();

            String sql = """
                    INSERT INTO cancelled_voided (transaction_number, order_time, total_cost, order_notes)
                    VALUES (?, ?, ?, ?)
                    """;

            try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                stmt.setInt(1, transactionNumber);
                stmt.setTimestamp(2, Timestamp.valueOf(LocalDateTime.now()));
                stmt.setDouble(3, total);
                stmt.setString(4, orderNotes);
                stmt.executeUpdate();
            }

            return new OrderResponse(transactionNumber, "CANCELLED", total, "Order cancelled successfully");
        }
    }

    /**
     * Ensures the order has items and, for real checkout, a payment method.
     */
    private void validateOrder(OrderRequest request, boolean requirePaymentMethod) throws Exception {
        if (request == null || request.getItems() == null || request.getItems().isEmpty()) {
            throw new Exception("Order must contain at least one item");
        }

        if (requirePaymentMethod && (request.getPaymentMethod() == null || request.getPaymentMethod().isBlank())) {
            throw new Exception("Payment method is required");
        }
    }

    /**
     * Standardizes payment method strings.
     */
    private String normalizePaymentMethod(String paymentMethod) {
        if (paymentMethod == null) {
            return null;
        }

        String normalized = paymentMethod.trim().toUpperCase();
        if (normalized.equals("CARD") || normalized.equals("CASH")) {
            return normalized;
        }

        return paymentMethod.trim();
    }

    /**
     * Recomputes total on the backend.
     */
    private double computeTotal(List<Drink> items) {
        return items.stream().mapToDouble(Drink::getTotalPrice).sum();
    }

    /**
     * Temporary ID generation using MAX + 1.
     *
     * This works for a small class project, but a sequence/identity column
     * would be better in production.
     */
    private int getNextId(Connection conn, String tableName, String columnName) throws Exception {
        String sql = "SELECT COALESCE(MAX(" + columnName + "), 0) + 1 AS next_id FROM " + tableName;

        try (PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            rs.next();
            return rs.getInt("next_id");
        }
    }

    /**
     * Inserts one row into sales.
     */
    private void insertSale(Connection conn,
                            int transactionNumber,
                            double total,
                            String orderNotes,
                            String paymentMethod) throws Exception {

        String sql = """
                INSERT INTO sales (transaction_number, order_time, total_cost, order_notes, payment_method)
                VALUES (?, ?, ?, ?, ?)
                """;

        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, transactionNumber);
            stmt.setTimestamp(2, Timestamp.valueOf(LocalDateTime.now()));
            stmt.setDouble(3, total);
            stmt.setString(4, orderNotes);
            stmt.setString(5, paymentMethod);
            stmt.executeUpdate();
        }
    }

    /**
     * Inserts one row into items_purchased for each drink in the cart.
     */
    private void insertPurchasedItem(Connection conn,
                                     int itemId,
                                     int transactionNumber,
                                     Drink drink,
                                     String notes) throws Exception {

        String sql = """
                INSERT INTO items_purchased (id_number, item_name, transaction_number, price, notes)
                VALUES (?, ?, ?, ?, ?)
                """;

        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, itemId);
            stmt.setString(2, drink.getName());
            stmt.setInt(3, transactionNumber);
            stmt.setDouble(4, drink.getTotalPrice());
            stmt.setString(5, notes == null ? "" : notes);
            stmt.executeUpdate();
        }
    }

    /**
     * Determines the ingredients used by a drink + its modifications,
     * records them in items_purchased_to_ingredients,
     * then subtracts those ingredient amounts from inventory.
     */
    private void insertIngredientsAndUpdateInventory(Connection conn,
                                                     Drink drink,
                                                     int itemId,
                                                     int transactionNumber) throws Exception {

        Map<String, Double> ingredientUsage = new HashMap<>();

        // Add base drink recipe ingredients
        addIngredientUsage(conn, ingredientUsage, drink.getName());

        // Add ingredients contributed by selected modifications
        if (drink.getModifications() != null) {
            for (Modification modification : drink.getModifications()) {
                if (modification.getName() != null && !modification.getName().isBlank()) {
                    addIngredientUsage(conn, ingredientUsage, modification.getName());
                }
            }
        }

        String insertSql = """
                INSERT INTO items_purchased_to_ingredients
                    (item_name, item_id, transaction_number, ingredient, quantity_used)
                VALUES (?, ?, ?, ?, ?)
                """;

        String updateInventorySql = """
                UPDATE ingredients_alterations
                SET amt_in_stock = amt_in_stock - ?
                WHERE name = ?
                """;

        try (PreparedStatement insertStmt = conn.prepareStatement(insertSql);
             PreparedStatement updateStmt = conn.prepareStatement(updateInventorySql)) {

            for (Map.Entry<String, Double> entry : ingredientUsage.entrySet()) {
                String ingredientName = entry.getKey();
                double quantityUsed = entry.getValue();

                if (quantityUsed <= 0) {
                    continue;
                }

                insertStmt.setString(1, drink.getName());
                insertStmt.setInt(2, itemId);
                insertStmt.setInt(3, transactionNumber);
                insertStmt.setString(4, ingredientName);
                insertStmt.setDouble(5, quantityUsed);
                insertStmt.executeUpdate();

                updateStmt.setDouble(1, quantityUsed);
                updateStmt.setString(2, ingredientName);
                updateStmt.executeUpdate();
            }
        }
    }

    /**
     * Looks up recipe rows from menu_to_ingredients and merges them into
     * the running ingredient usage map.
     */
    private void addIngredientUsage(Connection conn,
                                    Map<String, Double> ingredientUsage,
                                    String menuItemName) throws Exception {

        String sql = """
                SELECT ingredient, quantity_used
                FROM menu_to_ingredients
                WHERE menu_item = ?
                """;

        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, menuItemName);

            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    String ingredient = rs.getString("ingredient");
                    double quantity = rs.getDouble("quantity_used");
                    ingredientUsage.merge(ingredient, quantity, Double::sum);
                }
            }
        }
    }
}