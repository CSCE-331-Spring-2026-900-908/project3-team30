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

    @GetMapping("/menu-categories")
    public List<String> getCategories() throws Exception{
        return menuBoardService.getCategories();
    }

    @GetMapping("/items/{category}")
    public List<MenuItem> getCategoryItems(@PathVariable String category) throws Exception{
        return menuBoardService.getCategoryItems(category);
    }
    
}
