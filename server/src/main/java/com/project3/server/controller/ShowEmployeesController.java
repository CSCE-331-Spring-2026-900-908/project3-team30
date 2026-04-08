package com.project3.server.controller;

import com.project3.server.model.ManageEmployees;
import com.project3.server.service.ManageEmployeesService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api")
public class ShowEmployeesController {
    private final ManageEmployeesService manageEmployeesService;

    public ShowEmployeesController(ManageEmployeesService manageEmployeesService) {
        this.manageEmployeesService = manageEmployeesService;
    }

    @GetMapping("/manage-employees") //this is what will go in Api.js
    //first will be SHOWING the table of current employees
    public List<ManageEmployees> getEmployeeList() throws Exception {
        return manageEmployeesService.getEmployeeList();
    }
}
