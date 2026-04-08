package com.project3.server.model;

public class ManageEmployees {
    private int code;
    private String firstName;
    private String lastName;
    private String role;

    public ManageEmployees(int code, String firstName, String lastName, String role) {
        this.code = code;
        this.firstName = firstName;
        this.lastName = lastName;
        this.role = role;
    }

    public int getCode() {
        return code;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public String getRole() {
        return role;
    }
    
}
