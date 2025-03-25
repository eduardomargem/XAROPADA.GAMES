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
        Usuario usuario = iUsuario.findByDs_email(username);
    
        if (usuario == null) {
            logger.warn("Usuário não encontrado: {}", username);
            return false;  // Retorna falso se o usuário não for encontrado
        }
    
        if (usuario.getDs_senha().equals(password)) {
            return true;  // Retorna verdadeiro se a senha estiver correta
        } else {
            logger.warn("Falha de autenticação para o usuário: {}. Senha incorreta.", username);
            return false;  // Senha incorreta
        }
    }
    

    // Método para recuperar o id_grupo de um usuário pelo e-mail
    public Integer getIdGrupo(String username) {
        Usuario usuario = iUsuario.findByDs_email(username);
        if (usuario != null) {
            return usuario.getId_grupo();  // Retorna o id_grupo
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
            updatedUser.setDs_nome(usuario.getDs_nome());
            updatedUser.setNr_cpf(usuario.getNr_cpf());
            updatedUser.setDs_email(usuario.getDs_email());
            updatedUser.setDs_senha(usuario.getDs_senha());
            updatedUser.setId_grupo(usuario.getId_grupo());
            updatedUser.setBo_status(usuario.getBo_status());

            // Salva o usuário atualizado
            return iUsuario.save(updatedUser);
        } else {
            logger.warn("Usuário não encontrado para atualização: {}", usuario.getId());
            return null; // Retorna null caso o usuário não exista
        }
    }
}
