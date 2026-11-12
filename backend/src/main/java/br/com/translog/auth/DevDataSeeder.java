package br.com.translog.auth;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/** Cria o usuário de demonstração (admin@translog.com / admin123). SOMENTE no perfil dev. */
@Component
@Profile("dev")
public class DevDataSeeder implements CommandLineRunner {

    private final UsuarioRepository repo;
    private final PasswordEncoder encoder;

    public DevDataSeeder(UsuarioRepository repo, PasswordEncoder encoder) {
        this.repo = repo;
        this.encoder = encoder;
    }

    @Override
    public void run(String... args) {
        if (!repo.existsByEmail("admin@translog.com")) {
            repo.save(new Usuario("Administrador", "admin@translog.com", encoder.encode("admin123")));
        }
    }
}
