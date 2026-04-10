package com.project3.server.controller;

import com.project3.server.model.AlterationOptionsResponse;
import com.project3.server.service.ModificationService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Exposes alteration/modification choices to the frontend.
 */
@RestController
@RequestMapping("/api")
public class ModificationController {

    private final ModificationService modificationService;

    public ModificationController(ModificationService modificationService) {
        this.modificationService = modificationService;
    }

    @GetMapping("/alterations")
    public AlterationOptionsResponse getAlterations() throws Exception {
        return modificationService.getAlterations();
    }
}