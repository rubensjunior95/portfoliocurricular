package com.rubensjr.portfolio.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.rubensjr.portfolio.service.PortfolioContentService;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/portfolio")
public class PortfolioController {

    private final PortfolioContentService service;

    public PortfolioController(PortfolioContentService service) {
        this.service = service;
    }

    /** Lista os idiomas disponíveis. */
    @GetMapping("/locales")
    public Map<String, List<String>> locales() {
        return Map.of("locales", service.availableLocales());
    }

    /** Conteúdo completo do portfólio no idioma solicitado (pt-BR, en-US, es-ES). */
    @GetMapping("/{locale}")
    public ResponseEntity<JsonNode> byLocale(@PathVariable String locale) {
        return service.byLocale(locale)
                .map(node -> ResponseEntity.ok()
                        .cacheControl(CacheControl.maxAge(Duration.ofMinutes(10)).cachePublic())
                        .body(node))
                .orElse(ResponseEntity.notFound().build());
    }
}
