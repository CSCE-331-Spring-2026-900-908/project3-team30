package com.project3.server.controller;

import com.project3.server.service.WomanService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class WomanController {

    private final WomanService womanService;

    public WomanController(WomanService womanService) {
        this.womanService = womanService;
    }

    @GetMapping("/woman")
    public Map<String, Object> getWoman() {
        return womanService.fetchRandomWoman();
    }
}
