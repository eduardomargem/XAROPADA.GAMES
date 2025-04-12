package br.com.xaropadagames.projeto.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Desativa proteção CSRF para APIs REST
            .csrf(csrf -> csrf.disable())
            
            // Configura CORS
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // Configura regras de acesso
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/**").permitAll()  // Permite TODOS os endpoints
                .anyRequest().permitAll()
            )
            
            // Desabilita segurança para frames (se usar H2 Console)
            .headers(headers -> headers.frameOptions().disable());
        
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("*"));  // Permite todas origens
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setExposedHeaders(Arrays.asList("Authorization"));
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}