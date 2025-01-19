# .devcontainer/Dockerfile
FROM node:18-bullseye

# 作業ディレクトリを作成
WORKDIR /workspace

# 必要なツールをインストール
RUN apt-get update && apt-get install -y \
  curl \
  git \
  bash \
  && rm -rf /var/lib/apt/lists/*

# npm と yarn をインストール
RUN npm install -g npm@latest
