package com.project3.server.service;

import com.project3.server.model.Order;
import com.project3.server.model.Drink;
import com.project3.server.model.Modification;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.sql.Connection;
import java.sql.Date;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;


@Service
public class KitchenService {
    @Value("${spring.datasource.url}")
    private String dbUrl;

    @Value("${spring.datasource.username}")
    private String dbUser;

    @Value("${spring.datasource.password}")
    private String dbPassword;

public List<Order> getActiveOrders() {
    List<Order> orders = new ArrayList<>();

    String sql = """
        SELECT 
            s.transaction_number,
            s.order_time,
            s.complete,
            i.item_name,
            i.notes
        FROM sales s
        JOIN items_purchased i 
            ON s.transaction_number = i.transaction_number
        WHERE s.complete = false
        ORDER BY s.transaction_number ASC
    """;

    try (
        Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPassword);
        PreparedStatement stmt = conn.prepareStatement(sql);
        ResultSet rs = stmt.executeQuery();
    ) {

        Map<Integer, Order> orderMap = new LinkedHashMap<>();

        while (rs.next()) {
            int transactionNumber = rs.getInt("transaction_number");

            Order order = orderMap.get(transactionNumber);

            if (order == null) {
                order = new Order();
                order.setOrderNum(transactionNumber);
                order.setTimestamp(rs.getTimestamp("order_time"));
                order.setComplete(rs.getBoolean("complete"));
                order.setDrinks(new ArrayList<>());

                orderMap.put(transactionNumber, order);
            }

            Drink item = new Drink();
            item.setName(rs.getString("item_name"));

            String notes = rs.getString("notes");
            List<Modification> mods = new ArrayList<>();

            if (notes != null && !notes.trim().isEmpty()) {
                for (String modStr : notes.split(",")) {
                    String clean = modStr.trim();
                    if (!clean.isEmpty()) {
                        mods.add(new Modification(clean, 0.0));
                    }
                }
            }

            item.setModifications(mods);
            order.getDrinks().add(item);
        }

        orders = new ArrayList<>(orderMap.values());

    } catch (Exception e) {
        e.printStackTrace();
    }

    return orders;
}
    public List<Order> getCompletedOrders() {
        List<Order> orders = new ArrayList<>();

        String sql = """
            SELECT 
                s.transaction_number,
                s.order_time,
                s.complete,
                s.complete_time,
                i.item_name,
                i.notes
            FROM sales s
            JOIN items_purchased i 
                ON s.transaction_number = i.transaction_number
            WHERE s.transaction_number IN (
                SELECT transaction_number
                FROM sales
                WHERE complete = true
                ORDER BY complete_time DESC
                LIMIT 15
            )
            ORDER BY s.complete_time DESC, s.transaction_number DESC
        """;

        try (
            Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPassword);
            PreparedStatement stmt = conn.prepareStatement(sql);
            ResultSet rs = stmt.executeQuery();
        ) {

            Map<Integer, Order> orderMap = new LinkedHashMap<>();

            while (rs.next()) {
                int transactionNumber = rs.getInt("transaction_number");

                Order order = orderMap.get(transactionNumber);

                if (order == null) {
                    order = new Order();
                    order.setOrderNum(transactionNumber);
                    order.setTimestamp(rs.getTimestamp("order_time"));
                    order.setComplete(rs.getBoolean("complete"));
                    order.setDrinks(new ArrayList<>());

                    orderMap.put(transactionNumber, order);
                }

                Drink item = new Drink();
                item.setName(rs.getString("item_name"));

                String notes = rs.getString("notes");
                List<Modification> mods = new ArrayList<>();

                if (notes != null && !notes.trim().isEmpty()) {
                    for (String modStr : notes.split(",")) {
                        String clean = modStr.trim();
                        if (!clean.isEmpty()) {
                            mods.add(new Modification(clean, 0.0));
                        }
                    }
                }

                item.setModifications(mods);
                order.getDrinks().add(item);
            }

            orders = new ArrayList<>(orderMap.values());

        } catch (Exception e) {
            e.printStackTrace();
        }

        return orders;
    }

    public void markComplete(int transactionNumber) {

    String sql = "UPDATE sales SET complete = NOT complete, complete_time = CASE WHEN complete = false THEN NOW() ELSE NULL END WHERE transaction_number = ?";

    try (
        Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPassword);
        PreparedStatement stmt = conn.prepareStatement(sql);
    ) {
        stmt.setInt(1, transactionNumber);
        stmt.executeUpdate();

    } catch (Exception e) {
        e.printStackTrace();
    }
    //TODO create the markcomplete for the drinks
    //TODO allow uncheck 
    //TODO have the complete time displayed as well on the UI; right now it's just order time
}

    
}
