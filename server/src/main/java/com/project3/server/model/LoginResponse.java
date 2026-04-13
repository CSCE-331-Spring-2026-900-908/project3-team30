package com.project3.server.model;
/**
 * This is a model class that represents the response for a login request, which includes the necessary fields for the login response
 * @author Karla Sanchez
 */

public class LoginResponse {
    private String role;
    private String message;

    public LoginResponse(String role, String message) {
        this.role = role;
        this.message = message;
    }

    public String getRole() {
        return role;
    }

    public String getMessage() {
        return message;
    }
}