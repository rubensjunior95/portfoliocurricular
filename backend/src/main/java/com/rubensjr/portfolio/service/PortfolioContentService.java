package com.rubensjr.portfolio.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Carrega o conteúdo do portfólio (pt-BR, en-US, es-ES) dos arquivos JSON
 * em resources/data e mantém em memória.
 */
@Service
public class PortfolioContentService {

    private static final List<String> LOCALES = List.of("pt-BR", "en-US", "es-ES");
    private static final String DEFAULT_LOCALE = "pt-BR";

    private final ObjectMapper objectMapper;
    private final Map<String, JsonNode> content = new LinkedHashMap<>();

    public PortfolioContentService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @PostConstruct
    void load() {
        for (String locale : LOCALES) {
            try (InputStream in = new ClassPathResource("data/" + locale + ".json").getInputStream()) {
                content.put(locale, objectMapper.readTree(in));
            } catch (IOException e) {
                throw new UncheckedIOException("Falha ao carregar conteúdo do locale " + locale, e);
            }
        }
    }

    public List<String> availableLocales() {
        return LOCALES;
    }

    public Optional<JsonNode> byLocale(String locale) {
        if (locale == null) {
            return Optional.of(content.get(DEFAULT_LOCALE));
        }
        // Aceita "pt-BR", "pt-br", "pt", "en", "es"...
        String normalized = LOCALES.stream()
                .filter(l -> l.equalsIgnoreCase(locale) || l.substring(0, 2).equalsIgnoreCase(locale.substring(0, Math.min(2, locale.length()))))
                .findFirst()
                .orElse(null);
        return Optional.ofNullable(normalized == null ? null : content.get(normalized));
    }
}
