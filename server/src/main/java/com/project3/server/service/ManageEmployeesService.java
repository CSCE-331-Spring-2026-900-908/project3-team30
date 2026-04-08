package com.project3.server.service;

import com.project3.server.model.ManageEmployees;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

@Service
public class ManageEmployeesService {
    @Value("${spring.datasource.url}")
    private String dbUrl;

    @Value("${spring.datasource.username}")
    private String dbUser;

    @Value("${spring.datasource.password}")
    private String dbPassword;

    int code = 0;
    String firstName = "";
    String lastName = "";
    // boolean isManager = false;
    boolean role = false;

    public List<ManageEmployees> getEmployeeList() throws Exception { //this will be refresh table
        try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPassword)) {
            String getEmployees = "SELECT code, first_name, last_name, is_manager FROM users ORDER BY code";
            try (PreparedStatement ps = conn.prepareStatement(getEmployees);
                 ResultSet rs = ps.executeQuery()) {
                List<ManageEmployees> employees = new ArrayList<>();
                while (rs.next()) {
                    boolean isManager = rs.getBoolean("is_manager");
                    String role = isManager ? "manager" : "cashier";
                    employees.add(new ManageEmployees(
                        rs.getInt("code"),
                        rs.getString("first_name"),
                        rs.getString("last_name"),
                        role
                    ));
                }
                return employees;
            } catch (Exception e) {
                System.err.println("Error executing get employees query: " + e.getMessage());
                throw e; // Rethrow the exception to be handled by the controller
            }
        }
    }

    // public void handleAdd() throws Exception {
    //     try (Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPassword)) {
    //         if (codeField == 0) {
    //             System.err.println("Code field is required.");
    //             return;
    //         }

    //         String addUser = "INSERT INTO users (code, first_name, last_name, is_manager) VALUES (?, ?, ?, ?)";

    //         try (PreparedStatement ps = conn.prepareStatement(addUser);
    //             ResultSet rs = ps.executeQuery()) {
    //             ps.setInt(1, codeField);
    //             ps.setString(2, firstNameField);
    //             ps.setString(3, lastNameField);
    //             ps.setString(4, isManagerCheck);

    //             ps.executeUpdate();
    //             System.out.println("Added user " + codeField);
    //             getManageEmployees(); // Refresh the table after adding
    //         } catch (Exception e) {
    //             System.err.println("Error executing add user query: " + e.getMessage()); 
    //         }
    //     }
    // }
}