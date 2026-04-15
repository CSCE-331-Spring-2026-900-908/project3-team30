package com.project3.server.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.SecurityFilterChain;
// karla - requires local to dev changes
@Configuration
public class GoogleSecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
            .cors(Customizer.withDefaults())
            .csrf(csrf -> csrf.disable())

            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/oauth2/**",
                    "/login/**",
                    "/error",
                    "/api/login"
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
                        response.sendRedirect("http://localhost:5173/manager?oauth=success");
                    } else {
                        response.sendRedirect("http://localhost:5173/manager-login?error=unauthorized");
                    }
                })

                .failureHandler((request, response, exception) -> {
                    response.sendRedirect("http://localhost:5173/manager-login?error=oauth_failed");
                })
            )

            .logout(logout -> logout
                .logoutSuccessUrl("/")
                .permitAll()
            );

        return http.build();
    }
}