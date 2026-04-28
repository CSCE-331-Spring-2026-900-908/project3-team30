package com.project3.server.service;

import com.project3.server.model.LoginResponse;
import org.springframework.stereotype.Service;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import javax.sql.DataSource;

/**
 * This is a service that handles the business logic for logging in to the application
 * @author Karla Sanchez
 */
@Service
public class LoginService {
    private final DataSource dataSource;

    public LoginService(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public LoginResponse login(String pin) throws Exception {
        if (pin == null || pin.length() != 4) {
            throw new Exception("Enter 4-digit employee PIN");
        }

        int enteredCode = Integer.parseInt(pin);

        String sql = "SELECT is_manager, first_name, last_name FROM users WHERE code = ?";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setInt(1, enteredCode);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    boolean isManager = rs.getBoolean("is_manager");
                    String role = isManager ? "manager" : "cashier";
                    String firstName = rs.getString("first_name");
                    String lastName = rs.getString("last_name");
                    return new LoginResponse(role, "Login successful", firstName, lastName);
                }
            }
        }

        throw new Exception("Invalid PIN");
    }
}