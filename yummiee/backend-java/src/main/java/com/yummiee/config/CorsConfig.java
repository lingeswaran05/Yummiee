package com.yummiee.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {

    @Value("${yummiee.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                String allowedUrl = (frontendUrl != null && !frontendUrl.trim().isEmpty())
                        ? frontendUrl.trim()
                        : "http://localhost:5173";

                registry.addMapping("/**")
                        .allowedOriginPatterns(
                                allowedUrl,
                                "http://localhost:*",
                                "http://127.0.0.1:*",
                                "https://*.web.app",
                                "https://*.firebaseapp.com",
                                "https://*.onrender.com"
                        )
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(true);
            }
        };
    }
}
