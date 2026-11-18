package br.com.translog.motorista;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Sort;

import java.util.List;

/**
 * Camada de acesso a dados. JpaSpecificationExecutor permite montar filtros opcionais (q/status)
 * sem JPQL com parâmetros nulos (que quebra no PostgreSQL).
 */
public interface MotoristaRepository extends JpaRepository<Motorista, Long>, JpaSpecificationExecutor<Motorista> {

    boolean existsByCpf(String cpf);

    boolean existsByCpfAndIdNot(String cpf, Long id);

    boolean existsByCnh(String cnh);

    boolean existsByCnhAndIdNot(String cnh, Long id);

    /**
     * Evita N+1 na listagem: busca as categorias no mesmo select em vez de uma consulta por motorista.
     * Como é uma coleção, o Hibernate 6 já remove as linhas repetidas do resultado.
     */
    @Override
    @EntityGraph(attributePaths = "categorias")
    List<Motorista> findAll(Specification<Motorista> spec, Sort sort);

    /**
     * Conta ocorrências do motorista via SQL nativo para não acoplar este módulo à entidade Ocorrencia
     * (que pertence ao módulo dos colegas). A tabela já existe desde a migration V1.
     */
    @Query(value = "select count(*) from ocorrencias where motorista_id = :id", nativeQuery = true)
    long contarOcorrencias(@Param("id") Long id);
}
