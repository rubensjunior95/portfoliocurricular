package com.rubensjr.portfolio.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

/**
 * Endpoints de health check.
 *
 * "/" e "/api/health" respondem 200 rapidamente — é a URL que o
 * cron-job.org deve "pingar" a cada 5-10 minutos para impedir que a
 * instância free da Render durma por inatividade.
 */
@RestController
public class HealthController {

    private static final Instant STARTED_AT = Instant.now();

    @GetMapping("/")
    public Map<String, Object> root() {
        return health();
    }

    @GetMapping("/api/health")
    public Map<String, Object> health() {
        return Map.of(
                "status", "UP",
                "service", "portfolio-backend",
                "startedAt", STARTED_AT.toString(),
                "timestamp", Instant.now().toString());
    }
}
