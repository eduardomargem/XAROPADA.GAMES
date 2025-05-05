package br.com.xaropadagames.projeto.config;

import jakarta.servlet.*;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;

import java.io.IOException;

@Component
public class JwtFilter implements Filter {
    @Autowired
    private JwtTokenService jwtTokenService;
    
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        
        // Ignora rotas públicas
        if (httpRequest.getRequestURI().startsWith("/usuarios/login") ||
            httpRequest.getRequestURI().startsWith("/usuarios/cadastrar")) {
            chain.doFilter(request, response);
            return;
        }
        
        // Obtém o token do cookie
        String token = null;
        Cookie[] cookies = httpRequest.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("token".equals(cookie.getName())) {
                    token = cookie.getValue();
                    break;
                }
            }
        }
        
        // // Valida o token
        // if (token == null || !jwtTokenService.isValidToken(token)) {
        //     httpResponse.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Token inválido ou expirado");
        //     return;
        // }
        
        // Adiciona as informações do usuário na requisição
        Claims claims = jwtTokenService.parseToken(token);
        httpRequest.setAttribute("username", claims.getSubject());
        httpRequest.setAttribute("grupo", claims.get("grupo"));
        
        chain.doFilter(request, response);
    }
}
