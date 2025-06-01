package br.com.xaropadagames.projeto.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import br.com.xaropadagames.projeto.dao.IUsuario;
import br.com.xaropadagames.projeto.model.LoginRequest;
import br.com.xaropadagames.projeto.model.Usuario;
import br.com.xaropadagames.projeto.service.UserService;
import jakarta.validation.Valid;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@CrossOrigin("*")
@RequestMapping("/usuarios")
public class UsuarioController {

    private static final Logger logger = LoggerFactory.getLogger(UsuarioController.class);

    @Autowired
    private UserService userService;

    @Autowired
    private IUsuario dao;
    
    // Método GET para listar todos os usuários
    @GetMapping
    public List<Usuario> listaUsuarios() {  
        return (List<Usuario>) dao.findAll();
    }

    // Método POST para criar um novo usuário
    @PostMapping
    public ResponseEntity<?> criarUsuario(@Valid @RequestBody Usuario usuario, BindingResult result) {
        if (result.hasErrors()) {
            logger.error("Erro de validação ao criar usuário: {}", result.getAllErrors());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(result.getAllErrors());
        }
        
        try {
            Usuario usuarioCadastrado = dao.save(usuario);
            logger.info("Usuário criado com sucesso: {}", usuarioCadastrado);
            return ResponseEntity.status(HttpStatus.CREATED).body(usuarioCadastrado);
        } catch (Exception e) {
            logger.error("Erro ao cadastrar o usuário: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("{\"message\": \"Erro ao cadastrar o usuário.\"}");
        }
    }

    // Método PUT para atualizar um usuário existente
    @PutMapping("/{id}")
    public ResponseEntity<?> alterarUsuario(@PathVariable Integer id, @Valid @RequestBody Usuario usuario, BindingResult result) {
        if (result.hasErrors()) {
            logger.error("Erro de validação ao alterar usuário: {}", result.getAllErrors());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(result.getAllErrors());
        }

        // Verificar se o usuário existe antes de tentar atualizar
        Usuario usuarioExistente = dao.findById(id).orElse(null);
        if (usuarioExistente == null) {
            logger.warn("Usuário não encontrado para atualização: {}", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("{\"message\": \"Usuário não encontrado.\"}");
        }

        // Atualiza os dados do usuário
        usuario.setId(id); // Garante que o ID do usuário seja mantido
        try {
            Usuario usuarioAtualizado = dao.save(usuario);
            logger.info("Usuário atualizado com sucesso: {}", usuarioAtualizado);
            return ResponseEntity.ok(usuarioAtualizado);
        } catch (Exception e) {
            logger.error("Erro ao atualizar o usuário: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("{\"message\": \"Erro ao atualizar o usuário.\"}");
        }
    }

    // Método POST para login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        Optional<Usuario> usuarioOpt = dao.findByDsEmail(loginRequest.getUsername());
        
        // Verifica se o usuário existe
        if (!usuarioOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("{\"message\": \"Usuário não encontrado.\"}");
        }
        
        Usuario usuario = usuarioOpt.get();
        
        // Verifica se o usuário está inativo
        if (usuario.getBoStatus() != null && usuario.getBoStatus() == 0) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("{\"message\": \"Usuário inativo. Contate o administrador.\"}");
        }
        
        // Verifica a senha
        if (userService.authenticateUser(loginRequest.getUsername(), loginRequest.getPassword())) {
            // Cria resposta padronizada
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Login realizado com sucesso");
            response.put("id", usuario.getId());
            response.put("dsNome", usuario.getDsNome());
            response.put("dsEmail", usuario.getDsEmail());
            response.put("id_grupo", usuario.getIdGrupo());
            
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                        "success", false,
                        "message", "Senha incorreta"
                    ));
        }
    }

    // Método PATCH para alterar o status do usuário (ativo/inativo)
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> alterarStatus(@PathVariable Integer id) {
        try {
            Usuario usuarioExistente = dao.findById(id).orElse(null);
            if (usuarioExistente == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("{\"message\": \"Usuário não encontrado.\"}");
            }

            // Alterna o status (1 = Ativo, 0 = Inativo)
            usuarioExistente.setBoStatus(usuarioExistente.getBoStatus() == 1 ? 0 : 1);

            Usuario usuarioAtualizado = dao.save(usuarioExistente);
            return ResponseEntity.ok(usuarioAtualizado);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("{\"message\": \"Erro ao atualizar o status do usuário.\"}");
        }
    }
}
