# Clube do Tião Frontend - Docker Setup

Este é o guia de configuração do Docker para o frontend React da aplicação Clube do Tião.

## Pré-requisitos

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)
- Configuração do arquivo hosts

## Configuração do arquivo hosts

Adicione a seguinte linha ao seu arquivo hosts (/etc/hosts no Linux/Mac ou C:\Windows\System32\drivers\etc\hosts no Windows):

```
127.0.0.1 musictest.localhost
```

## Estrutura do Docker

```
front-music/
├── docker/                  # Configurações Docker
│   └── nginx/               # Configurações Nginx
│       └── conf.d/          # Configurações de domínio
├── docker-compose.yml       # Configuração Docker Compose
└── .env.docker              # Variáveis de ambiente para Docker
```

## Instalação e Execução

1. **Configuração do ambiente Docker**

```bash
cp .env.docker .env
```

2. **Construa e inicie os containers**

```bash
docker-compose up -d
```

3. **Acesse o projeto**

- Frontend: [http://musictest.localhost:8000](http://musictest.localhost:8000)
- Ou diretamente via Vite: [http://localhost:5173](http://localhost:5173)

## Comandos Úteis

- **Iniciar os containers**

```bash
docker-compose up -d
```

- **Verificar logs**

```bash
docker-compose logs -f
```

- **Parar os containers**

```bash
docker-compose down
```

- **Executar comandos no container**

```bash
docker exec -it music-frontend sh
```

## Desenvolvimento

Com os containers em execução, qualquer alteração nos arquivos do projeto será automaticamente refletida no navegador graças ao hot-reload do Vite.

## Comunicação com o Backend

Para que o frontend possa se comunicar com o backend, certifique-se de que:

1. O backend (api-music) está rodando corretamente
2. O arquivo hosts está configurado com tanto `musictest.localhost` quanto `api.musictest.localhost`
3. A variável de ambiente `VITE_API_URL` está apontando para `http://api.musictest.localhost`

Caso esteja executando os dois projetos simultaneamente, certifique-se de que as portas não estão conflitando. 