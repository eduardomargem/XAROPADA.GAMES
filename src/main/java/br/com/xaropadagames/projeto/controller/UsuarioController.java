package br.com.xaropadagames.projeto.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import br.com.xaropadagames.projeto.dao.IUsuario;
import br.com.xaropadagames.projeto.dao.IProduto;
import br.com.xaropadagames.projeto.model.LoginRequest;
import br.com.xaropadagames.projeto.model.Usuario;
import br.com.xaropadagames.projeto.model.Produto;
import br.com.xaropadagames.projeto.service.UserService;
import jakarta.validation.Valid;

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
    private IUsuario usuarioDao;
    
    @Autowired
    private IProduto produtoDao;
    
    @GetMapping
    public ResponseEntity<?> listaUsuarios(@RequestParam Integer idGrupo) {  
        if (idGrupo != 1) { // Apenas administradores podem acessar
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Acesso negado.");
        }
        return ResponseEntity.ok(usuarioDao.findAll());
    }

    @GetMapping("/produtos")
    public ResponseEntity<Iterable<Produto>> listaProdutos() {
        return ResponseEntity.ok(produtoDao.findAll());
    }

    @PostMapping
    public ResponseEntity<?> criarUsuario(@Valid @RequestBody Usuario usuario, BindingResult result) {
        if (result.hasErrors()) {
            logger.error("Erro de validação ao criar usuário: {}", result.getAllErrors());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(result.getAllErrors());
        }
        
        try {
            Usuario usuarioCadastrado = usuarioDao.save(usuario);
            logger.info("Usuário criado com sucesso: {}", usuarioCadastrado);
            return ResponseEntity.status(HttpStatus.CREATED).body(usuarioCadastrado);
        } catch (Exception e) {
            logger.error("Erro ao cadastrar o usuário: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erro ao cadastrar o usuário.");
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        boolean isAuthenticated = userService.authenticateUser(loginRequest.getUsername(), loginRequest.getPassword());

        if (isAuthenticated) {
            return ResponseEntity.ok().body("Login bem-sucedido!");
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("E-mail ou senha incorretos!");
        }
    }
}
