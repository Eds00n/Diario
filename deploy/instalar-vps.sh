#!/usr/bin/env bash
# Instala ou atualiza o Nosso Diário na VPS (Ubuntu + Apache).
# Uso (como root):  bash instalar-vps.sh
# Rodar de novo depois = atualiza pra última versão, sem mexer nas memórias.
set -euo pipefail

REPO="https://github.com/Eds00n/Diario.git"
BRANCH="${BRANCH:-diario-v2}"
APP="/opt/diario-app"
DADOS="/var/www/diario-data"
ESTATICO_ANTIGO="/var/www/diario"
PORTA=3010

verde() { printf "\n\033[32m✓ %s\033[0m\n" "$1"; }
passo() { printf "\n\033[33m→ %s\033[0m\n" "$1"; }
erro() { printf "\n\033[31m✗ %s\033[0m\n" "$1"; exit 1; }

[ "$(id -u)" -eq 0 ] || erro "Rode como root."
[ -f "$DADOS/diario.json" ] || erro "Não achei $DADOS/diario.json. Mande a pasta diario-data pra VPS primeiro."

# 1. Node 22 + git + PM2
passo "Conferindo Node.js"
NODE_MAJ=$(node -v 2>/dev/null | sed 's/v\([0-9]*\).*/\1/' || echo 0)
if [ "${NODE_MAJ:-0}" -lt 20 ]; then
  passo "Instalando Node.js 22"
  apt-get update -y >/dev/null
  apt-get install -y ca-certificates curl gnupg git >/dev/null
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash - >/dev/null
  apt-get install -y nodejs >/dev/null
fi
command -v git >/dev/null || apt-get install -y git >/dev/null
command -v pm2 >/dev/null || npm install -g pm2 >/dev/null
verde "Node $(node -v), PM2 $(pm2 -v)"

# 2. Código
if [ -d "$APP/.git" ]; then
  passo "Atualizando o código ($BRANCH)"
  git -C "$APP" fetch --depth 1 origin "$BRANCH"
  git -C "$APP" checkout -B "$BRANCH" FETCH_HEAD
  git -C "$APP" reset --hard FETCH_HEAD
else
  passo "Baixando o código ($BRANCH)"
  git clone --depth 1 -b "$BRANCH" "$REPO" "$APP"
fi

# 3. Configuração (só pergunta na primeira vez)
ENV="$APP/.env.production"
if [ ! -f "$ENV" ] && [ -f /root/diario.env.production ]; then
  cp /root/diario.env.production "$ENV"
fi
if [ ! -f "$ENV" ]; then
  passo "Configuração inicial"
  read -rsp "  Escolha a senha do site: " SENHA; echo
  [ -n "$SENHA" ] || erro "A senha não pode ficar vazia."
  read -rp "  Nome dela (aparece nas assinaturas): " NOME_ELA
  cat > "$ENV" <<EOF
DIARIO_DATA_DIR=$DADOS
SITE_PASSWORD=$SENHA
NEXT_PUBLIC_BASE_PATH=/diario
NOME_ELE=Edson
NOME_ELA=${NOME_ELA:-ela}
EOF
  chmod 600 "$ENV"
  cp "$ENV" /root/diario.env.production   # guarda uma cópia fora da pasta do app
fi
verde "Configuração em $ENV"

# 4. Build
passo "Instalando dependências e gerando o build (leva 1–3 min)"
cd "$APP"
npm ci --no-audit --no-fund
npm run build
verde "Build pronto"

# 5. PM2
passo "Subindo o app na porta $PORTA"
if pm2 describe diario >/dev/null 2>&1; then
  pm2 reload ecosystem.config.cjs --update-env
else
  pm2 start ecosystem.config.cjs
fi
pm2 save >/dev/null
pm2 startup systemd -u root --hp /root >/dev/null 2>&1 || true
verde "App rodando (pm2 logs diario pra ver os logs)"

# 6. Apache: /diario passa a ir pro app
passo "Configurando o Apache"
a2enmod proxy proxy_http headers >/dev/null
cp "$APP/deploy/apache-diario.conf" /etc/apache2/conf-available/diario.conf
a2enconf diario >/dev/null
if [ -d "$ESTATICO_ANTIGO" ] && [ ! -L "$ESTATICO_ANTIGO" ]; then
  mv "$ESTATICO_ANTIGO" "${ESTATICO_ANTIGO}-estatico-antigo"
  verde "Site estático antigo guardado em ${ESTATICO_ANTIGO}-estatico-antigo"
fi
apachectl configtest
systemctl reload apache2
verde "Apache recarregado"

# 7. Teste
sleep 2
CODIGO=$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1/diario/login" || true)
if [ "$CODIGO" = "200" ]; then
  verde "Tudo certo! Abra http://157.250.199.153/diario"
else
  printf "\n\033[31m⚠ O teste em /diario/login respondeu %s. Veja: pm2 logs diario --lines 50\033[0m\n" "$CODIGO"
fi
