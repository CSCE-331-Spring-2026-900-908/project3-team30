package com.project3.server.model;

public class ManageEmployees {
    private int code;
    private String firstName;
    private String lastName;
    private String role;

    public ManageEmployees() {
    }

    public ManageEmployees(int code, String firstName, String lastName, String role) {
        this.code = code;
        this.firstName = firstName;
        this.lastName = lastName;
        this.role = role;
    }

    public int getCode() {
        return code;
    }

    public void setCode(int code) {
        this.code = code;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}