package br.com.xaropadagames.projeto.service;

import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import br.com.xaropadagames.projeto.config.JwtTokenService;
import br.com.xaropadagames.projeto.dao.IUsuario;
import br.com.xaropadagames.projeto.model.Usuario;

@Service
public class UserService {

    @Autowired
    private IUsuario iUsuario;

    @Autowired
    private JwtTokenService jwtTokenService;

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    public String authenticateUser(String username, String password) {
        Usuario usuario = iUsuario.findByDs_email(username);
    
        if (usuario == null || !usuario.getDsSenha().equals(password)) {
            logger.warn("Falha na autenticação para o usuário: {}", username);
            return null;
        }
        
        // Retorna o token JWT
        return jwtTokenService.generateToken(username, usuario.getIdGrupo());
    }
    

    // Método para recuperar o id_grupo de um usuário pelo e-mail
    public Integer getIdGrupo(String username) {
        Usuario usuario = iUsuario.findByDs_email(username);
        if (usuario != null) {
            return usuario.getIdGrupo();  // Retorna o id_grupo
        } else {
            logger.warn("Usuário não encontrado para o e-mail: {}", username);
            return null;  // Retorna null se o usuário não for encontrado
        }
    }

    public List<Usuario> getAllUsuarios() {
        return (List<Usuario>) iUsuario.findAll();
    }

    public Usuario updateUsuario(Usuario usuario) {
        Optional<Usuario> existingUser = iUsuario.findById(usuario.getId());

        if (existingUser.isPresent()) {
            Usuario updatedUser = existingUser.get();
            updatedUser.setDsNome(usuario.getDsNome());
            updatedUser.setNrCpf(usuario.getNrCpf());
            updatedUser.setDsEmail(usuario.getDsEmail());
            updatedUser.setDsSenha(usuario.getDsSenha());
            updatedUser.setIdGrupo(usuario.getIdGrupo());
            updatedUser.setBoStatus(usuario.getBoStatus());

            // Salva o usuário atualizado
            return iUsuario.save(updatedUser);
        } else {
            logger.warn("Usuário não encontrado para atualização: {}", usuario.getId());
            return null; // Retorna null caso o usuário não exista
        }
    }
}
