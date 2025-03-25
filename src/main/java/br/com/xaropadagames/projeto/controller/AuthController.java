package br.com.xaropadagames.projeto.controller;

import br.com.xaropadagames.projeto.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.ui.Model;

import jakarta.servlet.http.HttpSession;  // Alterado para Jakarta

@Controller
public class AuthController {

    @Autowired
    private UserService userService;

    @GetMapping("/login")
    public String loginPage() {
        return "login";  // Página de login (exemplo)
    }

    @PostMapping("/login")
    public String login(String username, String password, HttpSession session, Model model) {
        boolean isAuthenticated = userService.authenticateUser(username, password);

        if (isAuthenticated) {
            // Autenticação bem-sucedida, armazenando o usuário na sessão
            Integer idGrupo = userService.getIdGrupo(username);  // Supondo que tenha um método para obter o id do grupo
            session.setAttribute("id_grupo", idGrupo);

            // Redirecionando conforme o tipo de usuário
            if (idGrupo == 1) {
                return "redirect:/";  // Admin
            } else if (idGrupo == 2) {
                return "redirect:/";  // Estoquista
            } else {
                model.addAttribute("error", "Tipo de usuário não reconhecido.");
                return "login";
            }
        } else {
            model.addAttribute("error", "Usuário ou senha inválidos.");
            return "login";  // Retorna para a página de login com uma mensagem de erro
        }
    }
}
