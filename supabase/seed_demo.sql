-- =====================================================================
-- DADOS DE DEMONSTRAÇÃO (fictícios). Todos marcados com demo = true.
-- Para remover depois:  delete from public.relatos where demo = true;
-- =====================================================================
insert into public.relatos
  (categoria, nome, relato, relato_original, anonimo, autorizacao_publicacao, status, demo, data_aprovacao, data_publicacao)
values
  ('gratidao', '[DEMO] Carla Menezes',
   'Cheguei no Taber com vinte e poucos anos, sozinha em Curitiba, sem conhecer ninguém. Foi num GF numa quinta-feira que eu entendi o que é ter família de verdade. Hoje meus filhos crescem nessa casa, e eu sou grata por cada pessoa que abriu a porta pra mim.',
   'Cheguei no Taber com vinte e poucos anos, sozinha em Curitiba, sem conhecer ninguém. Foi num GF numa quinta-feira que eu entendi o que é ter família de verdade. Hoje meus filhos crescem nessa casa, e eu sou grata por cada pessoa que abriu a porta pra mim.',
   false, true, 'aprovado', true, now(), now()),

  ('milagre', '[DEMO] Anônimo',
   'Os médicos disseram que meu pai não passaria daquela semana. A igreja inteira orou com a gente num domingo à noite. Três dias depois ele saiu da UTI, e no mês seguinte estava sentado do meu lado no culto.',
   'Os médicos disseram que meu pai não passaria daquela semana. A igreja inteira orou com a gente num domingo à noite. Três dias depois ele saiu da UTI, e no mês seguinte estava sentado do meu lado no culto.',
   true, true, 'aprovado', true, now(), now()),

  ('transformacao', '[DEMO] Rafael Duarte',
   'Eu vivia de festa em festa e achava que igreja não era lugar pra mim. Um amigo me convidou pro culto de sábado e eu fui só pra agradar ele. Deus me alcançou naquela noite. Hoje sirvo no ministério de jovens e levo meus amigos comigo.',
   'Eu vivia de festa em festa e achava que igreja não era lugar pra mim. Um amigo me convidou pro culto de sábado e eu fui só pra agradar ele. Deus me alcançou naquela noite. Hoje sirvo no ministério de jovens e levo meus amigos comigo.',
   false, true, 'aprovado', true, now(), now()),

  ('gratidao', '[DEMO] Família Oliveira',
   'Obrigado, Taber, por ter sido casa quando a gente perdeu tudo na mudança. Ninguém deixou faltar nada na nossa mesa.',
   'Obrigado, Taber, por ter sido casa quando a gente perdeu tudo na mudança. Ninguém deixou faltar nada na nossa mesa.',
   false, true, 'aprovado', true, now(), now()),

  ('milagre', '[DEMO] Juliana P.',
   'Depois de seis anos tentando engravidar, recebemos a notícia no mês em que a igreja fez o jejum de janeiro. Nossa filha tem dois anos e o nome dela significa "presente de Deus". Cada vez que olho pra ela eu lembro que Deus ouve oração, e que ele respondeu a nossa no tempo dele, mesmo quando a gente já tinha parado de pedir. A gente conta essa história pra todo mundo que está esperando uma resposta.',
   'Depois de seis anos tentando engravidar, recebemos a noticia no mes em que a igreja fez o jejum de janeiro. Nossa filha tem dois anos e o nome dela significa "presente de Deus". Cada vez que olho pra ela eu lembro que Deus ouve oração, e que ele respondeu a nossa no tempo dele, mesmo quando a gente já tinha parado de pedir. A gente conta essa história pra todo mundo que está esperando uma resposta.',
   false, true, 'aprovado', true, now(), now()),

  ('transformacao', '[DEMO] Marcos Vieira',
   'Eu não falava com meu irmão fazia oito anos. Numa ministração sobre perdão eu liguei pra ele ainda do estacionamento.',
   'eu nao falava com meu irmao fazia 8 anos. numa ministração sobre perdao eu liguei pra ele ainda do estacionamento',
   false, true, 'pendente', true, null, null),

  ('gratidao', '[DEMO] Anônimo',
   'Sou grato pelo ministério infantil. Meu filho chega em casa cantando o louvor do domingo a semana inteira.',
   'Sou grato pelo ministério infantil. Meu filho chega em casa cantando o louvor do domingo a semana inteira.',
   true, false, 'pendente', true, null, null);

update public.relatos set editado = (relato <> relato_original) where demo = true;
