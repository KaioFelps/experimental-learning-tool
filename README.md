## Objetivo
Esse experimento visa conseguir integrar com uma LMS (o Moodle, especialmente) e
extrair as informações abaixo do curso que realizou o deploy desta LT:

- [ ] Materiais disponíveis;
- [x] Alunos matriculados;
- [ ] Notas.

## Configurando

#### 1. Chaves
Crie as chaves para a Learning Tool teste deste experimento com o
script `./gen-keys.sh`.

#### 2. Variáveis de ambiente
Utilize o comando `cp .env.sample .env` para copiar as variáveis de ambiente e,
em seguida, preencha os campos faltantes.

#### 3. Inicie o Moodle localmente
```bash
docker compose up -d # Inicializa os containers do Moodle e Maria DB
```

#### 4. Moodle
Acessando o Moodle, em
"http://localhost/mod/lti/coursetooledit.php?course=<ID DO CURSO>", adicione
a learning tool desse experimento (LTI 1.3) com os seguintes valores nos campos:

- Tool name: Teste
- Tool URL: http://localhost:3000/lti/launch
- Public Key Type: rsa
- Public Key: preencha com o conteúdo do arquivo gerado em ./keys/teste-tool.pem.pub
- Initiate Login URL: http://localhost:3000/login
- Redirection URI(s): http://localhost:3000/lti/launch
- Default Launch Container: embed

### Claims Específicos
Para obter informações ainda mais relevantes --- como nome e e-mail do usuário
logado, notas do curso, etc --- é necessário habilitar os outros serviços
opcionais nas configurações da LT no LMS (na categoria "Services" no Moodle,
por exemplo).

Para esse experimento, se não permitidos os serviços, a learning tool
lançará erros.

Após registrar a LT no Moodle local, clique em editar o curso e copie o
Client ID que o Moodle gerou para essa learning tool. Cole o ID como
valor da variável de ambiente `LTI_CLIENT_ID` no seu arquivo `.env`.

Na seção de privacidade, permita que a learning tool tenha acesso ao nome e ao
e-mail dos usuários.

## Rodando o APP
Após ter configurado tudo até aqui, inicie o servidor da Learning Tool com
o comando `npm run start:dev`.
