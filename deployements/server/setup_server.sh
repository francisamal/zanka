#!/bin/bash
set -e

echo "=== Updating packages ==="
sudo apt-get update

echo "=== Installing essential dependencies ==="
sudo apt-get install -y curl git gnupg build-essential nginx

echo "=== Installing Node.js v20 ==="
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

echo "=== Node & NPM Version ==="
node -v
npm -v

echo "=== Installing PM2 globally ==="
sudo npm install -g pm2

echo "=== PM2 Version ==="
pm2 -v

echo "=== Setup complete! ==="
