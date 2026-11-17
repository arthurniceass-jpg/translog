package br.com.translog.ocorrencia;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OcorrenciaRepository extends JpaRepository<Ocorrencia, Long>, JpaSpecificationExecutor<Ocorrencia> {

    /** A tabela existe na V1, mesmo enquanto o módulo de motoristas não está implementado. */
    @Query(value = "select count(*) from motoristas where id = :id", nativeQuery = true)
    long contarMotoristas(@Param("id") Long id);
}
