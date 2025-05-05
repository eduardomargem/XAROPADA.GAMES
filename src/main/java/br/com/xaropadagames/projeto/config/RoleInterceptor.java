package br.com.xaropadagames.projeto.config;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class RoleInterceptor implements HandlerInterceptor {
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) 
            throws Exception {
        
        // Pega o grupo do usuário do request (setado pelo JwtFilter)
        Integer grupo = (Integer) request.getAttribute("grupo");
        
        // Verifica se a rota requer admin e o usuário não é admin
        if (request.getRequestURI().startsWith("/api/admin") && grupo != 1) {
            response.sendError(HttpServletResponse.SC_FORBIDDEN, "Acesso negado");
            return false;
        }
        
        return true;
    }
}
