package br.com.translog.auth;

import br.com.translog.auth.dto.AuthResponse;
import br.com.translog.auth.dto.CadastroRequest;
import br.com.translog.auth.dto.LoginRequest;
import br.com.translog.auth.dto.UsuarioResponse;
import br.com.translog.common.ConflictException;
import br.com.translog.common.NotFoundException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UsuarioRepository repo;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    public AuthService(UsuarioRepository repo, PasswordEncoder encoder, JwtService jwt) {
        this.repo = repo;
        this.encoder = encoder;
        this.jwt = jwt;
    }

    @Transactional
    public AuthResponse cadastrar(CadastroRequest req) {
        String email = req.email().trim().toLowerCase();
        if (repo.existsByEmail(email)) {
            throw new ConflictException("Já existe uma conta com este e-mail.");
        }
        Usuario u = repo.save(new Usuario(req.nome().trim(), email, encoder.encode(req.senha())));
        return resposta(u);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest req) {
        Usuario u = repo.findByEmail(req.email().trim().toLowerCase())
                .filter(x -> encoder.matches(req.senha(), x.getSenhaHash()))
                .orElseThrow(() -> new BadCredentialsException("E-mail ou senha inválidos."));
        return resposta(u);
    }

    @Transactional(readOnly = true)
    public UsuarioResponse me(Long id) {
        return repo.findById(id).map(AuthService::paraDto)
                .orElseThrow(() -> new NotFoundException("Usuário não encontrado."));
    }

    private AuthResponse resposta(Usuario u) {
        return new AuthResponse(jwt.gerar(u), paraDto(u));
    }

    private static UsuarioResponse paraDto(Usuario u) {
        return new UsuarioResponse(u.getId(), u.getNome(), u.getEmail());
    }
}
