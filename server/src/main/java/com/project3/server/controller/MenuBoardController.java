package com.project3.server.controller;

import com.project3.server.model.MenuItem;
import com.project3.server.service.MenuBoardService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api")
public class MenuBoardController {

    private final MenuBoardService menuBoardService;

    public MenuBoardController(MenuBoardService menuBoardService){
        this.menuBoardService = menuBoardService;
    }

    @GetMapping("/menu-drinks")
    public List<MenuItem> getDrinks() throws Exception{
        return menuBoardService.getDrinks();
    }

    @GetMapping("/menu-toppings")
    public List<MenuItem> getToppings() throws Exception{
        return menuBoardService.getToppings();
    }
    
}
