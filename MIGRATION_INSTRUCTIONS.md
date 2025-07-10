# Instruções para Executar a Migração no Supabase

## Problema
O erro `syntax error at or near "supabase"` indica que você está tentando executar o **caminho do arquivo** em vez do **conteúdo do arquivo**.

## Solução Correta

### Passo a Passo:

1. **Abra o arquivo de migração**
   - No seu projeto, abra o arquivo: `supabase/migrations/20250709194223_bold_lake.sql`
   - **COPIE TODO O CONTEÚDO** do arquivo (não o nome do arquivo)

2. **Vá para o Supabase Dashboard**
   - Acesse [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Selecione seu projeto

3. **Abra o SQL Editor**
   - No menu lateral esquerdo, clique em "SQL Editor"
   - Clique em "New query" para criar uma nova consulta

4. **Execute a migração**
   - **COLE O CONTEÚDO COMPLETO** do arquivo de migração
   - O conteúdo deve começar com:
     ```sql
     /*
       # Esquema inicial do SIGHE - Sistema de Gestão de Horários Escolares
     ```
   - E terminar com a inserção do usuário admin
   - Clique em "Run" para executar

5. **Verifique se funcionou**
   - Vá para "Table Editor" no menu lateral
   - Você deve ver as tabelas: academic_years, users, subjects, segments, classes, etc.

## ❌ O que NÃO fazer:
- NÃO digite: `supabase/migrations/001_initial_schema.sql`
- NÃO execute o caminho do arquivo

## ✅ O que fazer:
- COPIE e COLE o conteúdo completo do arquivo SQL
- Execute o SQL no editor

## Conteúdo que deve ser executado:
O arquivo contém aproximadamente 200+ linhas de SQL que criam:
- 11 tabelas principais
- Índices para performance
- Políticas de segurança (RLS)
- Um usuário admin padrão

## Após a execução:
- Atualize sua aplicação
- Faça login com: admin@escola.com / 123456
- Os erros devem ser resolvidos

## Se ainda houver problemas:
1. Verifique se todas as tabelas foram criadas no Table Editor
2. Confirme que o usuário admin foi inserido na tabela `users`
3. Recarregue a aplicação completamente (Ctrl+F5)