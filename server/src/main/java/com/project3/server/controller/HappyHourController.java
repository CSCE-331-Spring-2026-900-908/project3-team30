package com.project3.server.controller;

import com.project3.server.model.HappyHour;
import com.project3.server.service.HappyHourService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class HappyHourController {

    private final HappyHourService happyHourService;

    public HappyHourController(HappyHourService happyHourService) {
        this.happyHourService = happyHourService;
    }

    @GetMapping("/happy-hour")
    public List<HappyHour> getHappyHours() throws Exception {
        return happyHourService.getHappyHours();
    }

    @PutMapping("/happy-hour/{day}")
    public HappyHour updateHappyHour(@PathVariable String day, @RequestBody HappyHour happyHour) throws Exception {
        return happyHourService.updateHappyHour(day, happyHour);
    }

    @DeleteMapping("/happy-hour/{day}")
    public HappyHour clearHappyHour(@PathVariable String day) throws Exception {
        return happyHourService.clearHappyHour(day);
    }
}