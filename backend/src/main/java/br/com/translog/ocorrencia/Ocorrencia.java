package br.com.translog.ocorrencia;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDate;

@Entity
@Table(name = "ocorrencias")
public class Ocorrencia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 160)
    private String titulo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TipoOcorrencia tipo;

    @Column(nullable = false, length = 2000)
    private String descricao;

    @Column(nullable = false)
    private LocalDate data;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusOcorrencia status;

    @Column(name = "veiculo_id", nullable = false)
    private Long veiculoId;

    @Column(name = "motorista_id")
    private Long motoristaId;

    protected Ocorrencia() {
    }

    public Long getId() { return id; }
    public String getTitulo() { return titulo; }
    public TipoOcorrencia getTipo() { return tipo; }
    public String getDescricao() { return descricao; }
    public LocalDate getData() { return data; }
    public StatusOcorrencia getStatus() { return status; }
    public Long getVeiculoId() { return veiculoId; }
    public Long getMotoristaId() { return motoristaId; }

    public void setTitulo(String titulo) { this.titulo = titulo; }
    public void setTipo(TipoOcorrencia tipo) { this.tipo = tipo; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public void setData(LocalDate data) { this.data = data; }
    public void setStatus(StatusOcorrencia status) { this.status = status; }
    public void setVeiculoId(Long veiculoId) { this.veiculoId = veiculoId; }
    public void setMotoristaId(Long motoristaId) { this.motoristaId = motoristaId; }
}
