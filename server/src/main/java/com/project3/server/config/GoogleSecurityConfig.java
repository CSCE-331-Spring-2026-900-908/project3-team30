package com.project3.server.config;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.SecurityFilterChain;

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
                                "/api/login",
                                "/api/manager-summary",
                                "/api/manage-employees/**",
                                "/api/reports/**"
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

                            // only these emails should be allowed in as manager
                            if (email != null && email.equalsIgnoreCase("reveille.bubbletea@gmail.com")) {
                                // response.sendRedirect("http://localhost:5173/manager?oauth=success");
                                response.sendRedirect("https://project3-team30.vercel.app/manager?oauth=success");

                            // karla
                            } else if (email != null && email.equalsIgnoreCase("karlasanchz@tamu.edu")) {
                                // response.sendRedirect("http://localhost:5173/manager?oauth=success");
                                response.sendRedirect("https://project3-team30.vercel.app/manager?oauth=success");
                            } else if (email != null && email.equalsIgnoreCase("sanchezkarly14@gmail.com")) {
                                // response.sendRedirect("http://localhost:5173/manager?oauth=success");
                                response.sendRedirect("https://project3-team30.vercel.app/manager?oauth=success");

                            //Jade    
                            } else if (email != null && email.equalsIgnoreCase("jazahar@tamu.edu")) {
                                // response.sendRedirect("http://localhost:5173/manager?oauth=success");
                                response.sendRedirect("https://project3-team30.vercel.app/manager?oauth=success");
                            }

                            // Rylee
                            else if (email != null && email.equalsIgnoreCase("rhunt@tamu.edu")) {
                                // response.sendRedirect("http://localhost:5173/manager?oauth=success");
                                response.sendRedirect("https://project3-team30.vercel.app/manager?oauth=success");
                            }

                            // Nitya
                            else if (email != null && email.equalsIgnoreCase("nityakhurana@tamu.edu")) {
                                // response.sendRedirect("http://localhost:5173/manager?oauth=success");
                                response.sendRedirect("https://project3-team30.vercel.app/manager?oauth=success");
                            }

                            // Evie
                            else if (email != null && email.equalsIgnoreCase("e_pugliese@tamu.edu")) {
                                // response.sendRedirect("http://localhost:5173/manager?oauth=success");
                                response.sendRedirect("https://project3-team30.vercel.app/manager?oauth=success");
                            }

                            // Anisha
                            else if (email != null && email.equalsIgnoreCase("anishatx@tamu.edu")) {
                                // response.sendRedirect("http://localhost:5173/manager?oauth=success");
                                response.sendRedirect("https://project3-team30.vercel.app/manager?oauth=success");
                            }
                        
                            else {
                                // response.sendRedirect("http://localhost:5173/manager-login?error=unauthorized");
                                response.sendRedirect("https://project3-team30.vercel.app/manager-login?error=unauthorized");
                                
                            }
                        })

                        .failureHandler((request, response, exception) -> {
                            response.sendRedirect("https://project3-team30.vercel.app/manager-login?error=oauth_failed");
                        })
                )

                .logout(logout -> logout
                        .logoutSuccessUrl("/")
                        .permitAll()
                );

        return http.build();
    }
}