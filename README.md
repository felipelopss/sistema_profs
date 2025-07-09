# SIGHE - Sistema de Gestão de Horários Escolares

Sistema completo para gestão de horários escolares com banco de dados real usando Supabase.

## 🚀 Funcionalidades

- **Gestão de Anos Letivos**: Controle de períodos letivos
- **Gestão de Professores**: Cadastro com login e senhas
- **Gestão de Disciplinas**: Controle de matérias e cargas horárias
- **Gestão de Turmas**: Organização de classes por segmentos
- **Gestão de Salas**: Controle de espaços e recursos
- **Associação Disciplina-Turma**: Vinculação automática
- **Geração Inteligente de Horários**: Motor de IA para otimização
- **Relatórios Completos**: Análises e estatísticas
- **Banco de Dados Real**: Persistência com Supabase

## 🛠️ Tecnologias

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Autenticação**: Sistema próprio com Supabase
- **Deploy**: Netlify
- **Icons**: Lucide React

## 📦 Configuração

### 1. Configurar Supabase

1. Crie uma conta no [Supabase](https://supabase.com)
2. Crie um novo projeto
3. Copie a URL e a chave anônima do projeto
4. Execute as migrações SQL em `supabase/migrations/001_initial_schema.sql`

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` baseado no `.env.example`:

```bash
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
```

### 3. Instalar Dependências

```bash
npm install
```

### 4. Executar Localmente

```bash
npm run dev
```

## 🔐 Login Padrão

- **Admin**: admin@escola.com / 123456
- **Professores**: Criados pelo admin com senhas personalizadas

## 📊 Estrutura do Banco

O sistema utiliza as seguintes tabelas principais:

- `academic_years` - Anos letivos
- `users` - Usuários (admin/professores)
- `subjects` - Disciplinas
- `classes` - Turmas
- `classrooms` - Salas de aula
- `time_slots` - Horários
- `class_subjects` - Associações disciplina-turma
- `schedules` - Horários das aulas
- `teacher_restrictions` - Restrições dos professores
- `teacher_preferences` - Preferências dos professores

## 🚀 Deploy

O sistema está configurado para deploy automático no Netlify. As variáveis de ambiente devem ser configuradas no painel do Netlify.

## 📝 Uso

1. **Configuração Inicial**:
   - Criar ano letivo
   - Cadastrar disciplinas
   - Cadastrar professores
   - Cadastrar salas
   - Configurar horários

2. **Gestão de Turmas**:
   - Criar turmas
   - Associar disciplinas às turmas
   - Definir professores para cada disciplina

3. **Geração de Horários**:
   - Usar o motor inteligente para gerar automaticamente
   - Ou criar manualmente através da grade

4. **Relatórios**:
   - Visualizar estatísticas
   - Exportar dados
   - Analisar conflitos

## 🔧 Desenvolvimento

Para contribuir com o projeto:

1. Fork o repositório
2. Crie uma branch para sua feature
3. Faça commit das mudanças
4. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.