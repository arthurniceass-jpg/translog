package br.com.translog.motorista;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;

import java.util.LinkedHashSet;
import java.util.Set;

/**
 * Entidade JPA da tabela "motoristas" (criada na migration V1). Nunca é exposta direto na API: use os DTOs.
 * As categorias da CNH ficam em motorista_categorias (uma linha por categoria) via @ElementCollection.
 */
@Entity
@Table(name = "motoristas")
public class Motorista {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String nome;

    @Column(nullable = false, unique = true, length = 11)
    private String cpf;

    @Column(nullable = false, unique = true, length = 11)
    private String cnh;

    @Column(nullable = false, length = 11)
    private String telefone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusMotorista status;

    /**
     * Listas pequenas: EAGER evita surpresa fora da transação. A PK (motorista_id, categoria) da V1
     * garante que não exista categoria repetida para o mesmo motorista.
     */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "motorista_categorias", joinColumns = @JoinColumn(name = "motorista_id"))
    @Column(name = "categoria", nullable = false, length = 1)
    private Set<String> categorias = new LinkedHashSet<>();

    protected Motorista() {
    }

    public Motorista(String nome, String cpf, String cnh, String telefone, StatusMotorista status) {
        this.nome = nome;
        this.cpf = cpf;
        this.cnh = cnh;
        this.telefone = telefone;
        this.status = status;
    }

    public Long getId() { return id; }
    public String getNome() { return nome; }
    public String getCpf() { return cpf; }
    public String getCnh() { return cnh; }
    public String getTelefone() { return telefone; }
    public StatusMotorista getStatus() { return status; }
    public Set<String> getCategorias() { return categorias; }

    public void setNome(String nome) { this.nome = nome; }
    public void setCpf(String cpf) { this.cpf = cpf; }
    public void setCnh(String cnh) { this.cnh = cnh; }
    public void setTelefone(String telefone) { this.telefone = telefone; }
    public void setStatus(StatusMotorista status) { this.status = status; }

    /**
     * Substitui as categorias na própria coleção gerenciada pelo Hibernate (não troque a instância:
     * o dirty checking precisa vê-la).
     */
    public void setCategorias(Set<String> categorias) {
        this.categorias.clear();
        if (categorias != null) {
            this.categorias.addAll(categorias);
        }
    }
}
