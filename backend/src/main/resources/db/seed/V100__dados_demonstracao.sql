-- Dados de demonstração (SOMENTE perfil dev). O usuário admin é criado por DevDataSeeder (BCrypt).
INSERT INTO veiculos (placa, marca, modelo, ano, status) VALUES
 ('ABC1D23','Volvo','FH 540',2021,'DISPONIVEL'),
 ('EFG4H56','Mercedes-Benz','Sprinter',2020,'EM_USO'),
 ('IJK7L89','Scania','R 450',2019,'MANUTENCAO'),
 ('MNO0P12','Fiat','Fiorino',2022,'DISPONIVEL'),
 ('QRS3T45','Honda','CG 160',2023,'EM_USO'),
 ('UVW6X78','Volkswagen','Constellation',2018,'DISPONIVEL');

INSERT INTO motoristas (nome, cpf, cnh, telefone, status) VALUES
 ('Carlos Andrade','12345678901','01234567890','81999990001','DISPONIVEL'),
 ('Fernanda Lima','23456789012','11234567891','81999990002','EM_VIAGEM'),
 ('Roberto Souza','34567890123','21234567892','81999990003','DISPONIVEL'),
 ('Juliana Castro','45678901234','31234567893','81999990004','INATIVO'),
 ('Marcos Vinícius','56789012345','41234567894','81999990005','EM_VIAGEM');

INSERT INTO motorista_categorias (motorista_id, categoria) VALUES
 ((SELECT id FROM motoristas WHERE cpf='12345678901'),'E'),
 ((SELECT id FROM motoristas WHERE cpf='23456789012'),'D'),
 ((SELECT id FROM motoristas WHERE cpf='34567890123'),'C'),
 ((SELECT id FROM motoristas WHERE cpf='45678901234'),'B'),
 ((SELECT id FROM motoristas WHERE cpf='56789012345'),'E');

INSERT INTO ocorrencias (titulo, tipo, descricao, data, status, veiculo_id, motorista_id) VALUES
 ('Revisão de freios','MANUTENCAO','Troca de pastilhas de freio e revisão geral.','2026-09-10','RESOLVIDA',
   (SELECT id FROM veiculos WHERE placa='IJK7L89'),(SELECT id FROM motoristas WHERE cpf='12345678901')),
 ('Atraso na entrega','ATRASO','Entrega atrasada por congestionamento na BR-101.','2026-09-22','RESOLVIDA',
   (SELECT id FROM veiculos WHERE placa='EFG4H56'),(SELECT id FROM motoristas WHERE cpf='34567890123')),
 ('Colisão no pátio','ACIDENTE','Colisão leve na traseira durante manobra no pátio.','2026-09-20','ABERTA',
   (SELECT id FROM veiculos WHERE placa='UVW6X78'),(SELECT id FROM motoristas WHERE cpf='56789012345')),
 ('Ar-condicionado com defeito','MANUTENCAO','Ar-condicionado da cabine sem funcionar.','2026-09-25','ABERTA',
   (SELECT id FROM veiculos WHERE placa='MNO0P12'),(SELECT id FROM motoristas WHERE cpf='23456789012')),
 ('Documentação vencida','OUTRO','Licenciamento do veículo vencido, aguardando regularização.','2026-09-15','EM_ANALISE',
   (SELECT id FROM veiculos WHERE placa='ABC1D23'),(SELECT id FROM motoristas WHERE cpf='23456789012'));
