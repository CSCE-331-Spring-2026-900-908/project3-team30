package com.project3.server.service;

import com.project3.server.model.LoginResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

/**
 * This is a service that handles the business logic for logging in to the application
 * @author Karla Sanchez
 */
@Service
public class LoginService {

    @Value("${spring.datasource.url}")
    private String DB_URL;

    @Value("${spring.datasource.username}")
    private String DB_USER;

    @Value("${spring.datasource.password}")
    private String DB_PASSWORD;

    public LoginResponse login(String pin) throws Exception {
        if (pin == null || pin.length() != 4) {
            throw new Exception("Enter 4-digit employee PIN");
        }

        int enteredCode = Integer.parseInt(pin);

        Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD);

        if (conn == null || conn.isClosed()) {
            throw new Exception("Database connection failed");
        }

        String sql = "SELECT is_manager FROM users WHERE code = ?";

        PreparedStatement pstmt = conn.prepareStatement(sql);
        pstmt.setInt(1, enteredCode);

        ResultSet rs = pstmt.executeQuery();

        if (rs.next()) {
            boolean isManager = rs.getBoolean("is_manager");
            String role = isManager ? "manager" : "cashier";

            rs.close();
            pstmt.close();
            conn.close();

            return new LoginResponse(role, "Login successful");
        }

        rs.close();
        pstmt.close();
        conn.close();

        throw new Exception("Invalid PIN");
    }
}