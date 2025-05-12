package br.com.xaropadagames.projeto.service;

import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import br.com.xaropadagames.projeto.dao.IUsuario;
import br.com.xaropadagames.projeto.model.Usuario;

@Service
public class UserService {

    @Autowired
    private IUsuario iUsuario;

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    public Boolean authenticateUser(String username, String password) {
        Optional<Usuario> usuarioOpt = iUsuario.findByDsEmail(username);
    
        if (!usuarioOpt.isPresent()) {
            logger.warn("Usuário não encontrado: {}", username);
            return false;
        }
        
        Usuario usuario = usuarioOpt.get();
        
        // Verifica se o usuário está inativo (bo_status = 0)
        if (usuario.getBoStatus() != null && usuario.getBoStatus() == 0) {
            logger.warn("Tentativa de login de usuário inativo: {}", username);
            return false;
        }
        
        if (usuario.getDsSenha().equals(password)) {
            return true;
        } else {
            logger.warn("Falha de autenticação para o usuário: {}. Senha incorreta.", username);
            return false;
        }
    }
    

    // Método para recuperar o id_grupo de um usuário pelo e-mail
    public Integer getIdGrupo(String username) {
        Optional<Usuario> usuarioOpt = iUsuario.findByDsEmail(username);
        
        if (usuarioOpt.isPresent()) {
            return usuarioOpt.get().getIdGrupo();  // Retorna o id_grupo se o usuário existir
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
