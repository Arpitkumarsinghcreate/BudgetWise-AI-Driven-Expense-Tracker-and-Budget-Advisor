package com.expense.tracker.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    public JwtAuthenticationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String auth = request.getHeader("Authorization");
        try {
            if (auth != null && auth.startsWith("Bearer ")) {
                String token = auth.substring(7);
                if (jwtUtil.isValid(token) && SecurityContextHolder.getContext().getAuthentication() == null) {
                    Claims claims = jwtUtil.parseClaims(token);
                    String email = claims.getSubject();
                    Long userId = claims.get("userId", Number.class).longValue();
                    AuthUser principal = new AuthUser(userId, email);
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(principal, null, Collections.emptyList());
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                } else {
                    log.debug("JWT invalid or missing authentication context for path {}", request.getRequestURI());
                }
            } else if (!"OPTIONS".equalsIgnoreCase(request.getMethod())) {
                log.debug("Authorization header missing or not Bearer for path {}", request.getRequestURI());
            }
        } catch (Exception ex) {
            log.warn("JWT processing failed for path {}", request.getRequestURI());
        }
        chain.doFilter(request, response);
    }
}
