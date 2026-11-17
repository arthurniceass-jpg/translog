package br.com.translog.dashboard;

import br.com.translog.dashboard.dto.ResumoResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Dashboard somente leitura. Todas as rotas /api/** exigem JWT (ver SecurityConfig). */
@RestController
@RequestMapping("/api/dashboard")
@Tag(name = "Dashboard")
public class DashboardController {

    private final DashboardService service;

    public DashboardController(DashboardService service) {
        this.service = service;
    }

    @GetMapping("/resumo")
    public ResumoResponse resumo() {
        return service.resumo();
    }
}
