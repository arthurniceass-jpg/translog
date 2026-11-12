package br.com.translog.veiculo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * Camada de acesso a dados. JpaSpecificationExecutor permite montar filtros opcionais (q/status)
 * sem JPQL com parâmetros nulos (que quebra no PostgreSQL).
 */
public interface VeiculoRepository extends JpaRepository<Veiculo, Long>, JpaSpecificationExecutor<Veiculo> {

    boolean existsByPlaca(String placa);

    boolean existsByPlacaAndIdNot(String placa, Long id);

    /**
     * Conta ocorrências do veículo via SQL nativo para não acoplar este módulo à entidade Ocorrencia
     * (que pertence ao módulo dos colegas). A tabela já existe desde a migration V1.
     */
    @Query(value = "select count(*) from ocorrencias where veiculo_id = :id", nativeQuery = true)
    long contarOcorrencias(@Param("id") Long id);
}
