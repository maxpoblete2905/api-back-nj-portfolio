# 🚀 Guía de Despliegue API NestJS en EC2 con GitHub Actions

---

## 🧷 Configuración Inicial de la Instancia EC2

| Acción                          | Comando                                                            | Ejemplo                                                  |
|--------------------------------|--------------------------------------------------------------------|----------------------------------------------------------|
| Conectarse a la instancia       | `ssh -i "<clave>.pem" ubuntu@<IP>`                                | `ssh -i "C:\Users\maxca\OneDrive\Escritorio\PORTAFOLIO\key-pair-max-poblete.pem" ubuntu@13.220.114.179`                 |
| Actualizar paquetes del sistema| `sudo apt update && sudo apt upgrade -y`                           | `sudo apt update && sudo apt upgrade -y`                |
| Instalar Node.js y npm         | `curl -fsSL https://deb.nodesource.com/setup_lts.x \| sudo -E bash -`<br>`sudo apt install -y nodejs` | `sudo apt install -y nodejs`                            |
| Instalar PM2                   | `sudo npm install -g pm2`                                          | `sudo npm install -g pm2`                               |

---

## 🧪 Clonar y Ejecutar la Aplicación

| Acción                  | Comando                                                  | Ejemplo                                                   |
|------------------------|----------------------------------------------------------|-----------------------------------------------------------|
| Instalar git           | `sudo apt install git -y`                                | `sudo apt install git -y` |
| Clonar repositorio     | `git clone <url>`                                        | `git clone git@github.com:maxpoblete/api-back-nj-portfolio.git` |
| Entrar al proyecto     | `cd <carpeta>`                                           | `cd api-back-nj-portfolio`                                |
| Instalar dependencias  | `npm install`                                            | `npm install`                                             |
| Compilar el proyecto   | `npm run build`                                          | `npm run build`                                           |
| Ejecutar con PM2       | `pm2 start dist/main.js --name <nombre>`                | `pm2 start dist/main.js --name api-nestjs`               |

---

## 🔑 Configuración de SSH para GitHub Actions

| Acción                         | Comando                                                            | Ejemplo                                                    |
|--------------------------------|--------------------------------------------------------------------|------------------------------------------------------------|
| Generar clave SSH              | `ssh-keygen -t rsa -b 4096 -C "ec2-deploy" -f ec2-deploy-key`     | `ssh-keygen -t rsa -b 4096 -C "ec2-deploy" -f ec2-deploy-key` |
| Codificar clave privada en base64 | `base64 -w 0 ec2-deploy-key`                                   | `base64 -w 0 ec2-deploy-key`                              |

> Luego agrega el resultado como secreto en GitHub: `EC2_SSH_KEY`

---

## 🎯 Secrets Requeridos en GitHub

| Nombre del Secret  | Descripción                                  |
|--------------------|----------------------------------------------|
| `EC2_SSH_KEY`      | Clave privada codificada en base64           |
| `EC2_HOST`         | Dirección IP o DNS público de la instancia   |

---

## ⚙️ Workflow de GitHub Actions para Despliegue

```yaml
name: Deploy to EC2

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout código
        uses: actions/checkout@v4

      - name: Crear archivo key.pem desde secret base64
        run: |
          echo "${{ secrets.EC2_SSH_KEY }}" | base64 -d > key.pem
          chmod 600 key.pem

      - name: Agregar host a known_hosts
        run: |
          mkdir -p ~/.ssh
          ssh-keyscan -H ${{ secrets.EC2_HOST }} >> ~/.ssh/known_hosts

      - name: Agregar key al agente SSH y ejecutar despliegue
        run: |
          eval "$(ssh-agent -s)"
          ssh-add key.pem
          ssh -o StrictHostKeyChecking=no ubuntu@${{ secrets.EC2_HOST }} << 'EOF'
            cd ~/api-back-nj-portfolio
            git pull origin main
            npm install
            npm run build
            pm2 restart api-nestjs || pm2 start dist/main.js --name api-nestjs
          EOF
