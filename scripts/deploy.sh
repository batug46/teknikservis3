#!/bin/bash

# Tekniverse.xyz Deploy Script
# Bu script sunucuda çalışacak

set -e  # Hata durumunda dur

echo "🚀 Starting deployment..."

# Renk kodları
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Proje dizini
PROJECT_DIR="/var/www/teknik-servis-v2"
APP_NAME="tekniverse-app"

echo -e "${BLUE}📁 Changing to project directory...${NC}"
cd $PROJECT_DIR

echo -e "${BLUE}🔄 Pulling latest changes from GitHub...${NC}"
git pull origin main

echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm ci --production

echo -e "${BLUE}🔧 Generating Prisma client...${NC}"
npx prisma generate

echo -e "${BLUE}🗄️ Running database migrations...${NC}"
npx prisma db push

echo -e "${BLUE}🏗️ Building Next.js application...${NC}"
npm run build

echo -e "${BLUE}🔄 Restarting PM2 application...${NC}"
if pm2 describe $APP_NAME > /dev/null 2>&1; then
    echo "App exists, restarting..."
    pm2 restart $APP_NAME
else
    echo "App doesn't exist, starting new..."
    pm2 start npm --name $APP_NAME -- start
fi

echo -e "${BLUE}💾 Saving PM2 configuration...${NC}"
pm2 save

echo -e "${BLUE}📊 PM2 Status:${NC}"
pm2 status

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${YELLOW}🌐 Site URL: https://tekniverse.xyz${NC}"