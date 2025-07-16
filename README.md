## Rodando o Moodle

```bash
cp .env.sample .env # Copia as variáveis de ambiente
docker compose up -d # Inicializa os containers do Moodle e Maria DB
```

## Configurando

Crie as chaves para a Learning Tool teste deste experimento com o
comando `ssh-keygen -t rsa -f ./keys/teste-tool -P=""`.

Acessando o Moodle, em "http://localhost/mod/lti/coursetooledit.php?course=<ID DO CURSO>", adicione a learning tool desse experimento
(LTI 1.3) com os seguintes valores nos campos:

- Tool name: Teste
- Tool URL: http://localhost:3000/lti/launch
- Public Key Type: rsa
- Public Key: copie a chave pública gerada com o comando acima
- Initiate Login URL: http://localhost:3000/login
- Redirection URI(s): http://localhost:3000/lti/launch
- Default Launch Container: embed

Após registrar a LT no Moodle local, clique em editar o curso e copie o Client ID que o Moodle gerou para essa learning tool. Cole o ID como
valor da variável de ambiente `LTI_CLIENT_ID` no seu arquivo `.env`.

## Rodando o APP
Após ter configurado tudo até aqui, inicie o servidor da Learning Tool com o comando `npm run start:dev`.
