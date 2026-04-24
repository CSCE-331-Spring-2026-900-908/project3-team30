package com.project3.server.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class GoogleSecurityConfig {

    @Value("${FRONTEND_BASE_URL}")
    private String frontendBaseUrl;
    // private final String frontendBaseUrl = "http://localhost:5173";

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
            .cors(Customizer.withDefaults())
            .csrf(csrf -> csrf.disable())

            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/api/woman",
                    "/oauth2/**",
                    "/login/**",
                    "/error",
                    "/api/login",
                    "/api/menu-**",
                    "/api/alterations",
                    "/api/orders/**",
                    "/api/kitchen/**",
                    "/api/chat", 
                    "/api/happy-hour/**"
                ).permitAll()
                .anyRequest().authenticated()
            )

            .formLogin(form -> form.disable())
            .httpBasic(basic -> basic.disable())

            .oauth2Login(oauth -> oauth
                .successHandler((request, response, authentication) -> {
                    OAuth2User user = (OAuth2User) authentication.getPrincipal();
                    String email = user.getAttribute("email");

                    System.out.println("=== OAUTH SUCCESS HANDLER HIT ===");
                    System.out.println("Authenticated email: " + email);

                    if (
                        email != null && (
                            email.equalsIgnoreCase("reveille.bubbletea@gmail.com") ||
                            email.equalsIgnoreCase("karlasanchz@tamu.edu") ||
                            email.equalsIgnoreCase("sanchezkarly14@gmail.com") ||
                            email.equalsIgnoreCase("jazahar@tamu.edu") ||
                            email.equalsIgnoreCase("rhunt@tamu.edu") ||
                            email.equalsIgnoreCase("nityakhurana@tamu.edu") ||
                            email.equalsIgnoreCase("e_pugliese@tamu.edu") ||
                            email.equalsIgnoreCase("anishatx@tamu.edu")
                        )
                    ) {
                        response.sendRedirect(frontendBaseUrl + "/manager?oauth=success");
                    } else {
                        response.sendRedirect(frontendBaseUrl + "/manager-login?error=unauthorized");
                    }
                })

                .failureHandler((request, response, exception) -> {
                    response.sendRedirect(frontendBaseUrl + "/manager-login?error=oauth_failed");
                })
            )

            .logout(logout -> logout
                .logoutSuccessUrl("/")
                .permitAll()
            );

        return http.build();
    }
}
