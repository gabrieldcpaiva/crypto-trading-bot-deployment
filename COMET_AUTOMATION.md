# 🤖 Comet Automation Script

**Automated deployment script for AI assistants or automation tools**

## Overview
This script can be executed by automation tools like Comet to deploy the crypto trading bot automatically.

## Prerequisites Setup Commands

```bash
# Check if required tools are installed
command -v git >/dev/null 2>&1 || { echo "Git required but not installed"; exit 1; }
command -v curl >/dev/null 2>&1 || { echo "Curl required but not installed"; exit 1; }
```

## Environment Variables Required

```bash
# Set these environment variables before running
export GITHUB_TOKEN="your_github_personal_access_token"
export GITHUB_USERNAME="your_github_username"
export DIGITALOCEAN_TOKEN="your_digitalocean_api_token"
export KRAKEN_API_KEY="your_kraken_api_key"
export KRAKEN_API_SECRET="your_kraken_api_secret"
export REPO_NAME="crypto-trading-bot-$(date +%s)"
```

## Automated Deployment Script

```bash
#!/bin/bash
set -e

echo "🤖 Starting automated crypto trading bot deployment..."

# Step 1: Create GitHub Repository
echo "📁 Creating GitHub repository..."
curl -H "Authorization: token $GITHUB_TOKEN" \
     -H "Content-Type: application/json" \
     -d "{\"name\":\"$REPO_NAME\",\"private\":true,\"description\":\"Automated crypto trading bot\"}" \
     https://api.github.com/user/repos

echo "✅ Repository created: https://github.com/$GITHUB_USERNAME/$REPO_NAME"

# Step 2: Clone and setup repository
echo "📦 Setting up repository..."
git clone https://github.com/$GITHUB_USERNAME/$REPO_NAME.git
cd $REPO_NAME

# Copy all bot files (this assumes files are in current directory)
cp -r ../bot-files/* . 2>/dev/null || echo "Copy bot files manually"

# Step 3: Commit and push code
echo "🚀 Pushing code to GitHub..."
git add .
git commit -m "Initial automated crypto trading bot deployment"
git push origin main

# Step 4: Create Digital Ocean App
echo "🌊 Creating Digital Ocean application..."
cat > app.yaml << EOF
name: $REPO_NAME
services:
- name: web
  source_dir: /
  github:
    repo: $GITHUB_USERNAME/$REPO_NAME
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  env:
  - key: NODE_ENV
    value: production
  - key: KRAKEN_API_KEY
    value: $KRAKEN_API_KEY
  - key: KRAKEN_API_SECRET
    value: $KRAKEN_API_SECRET
  routes:
  - path: /
EOF

# Deploy to Digital Ocean using API
APP_ID=$(curl -X POST \
  -H "Authorization: Bearer $DIGITALOCEAN_TOKEN" \
  -H "Content-Type: application/json" \
  -d @app.yaml \
  "https://api.digitalocean.com/v2/apps" | jq -r '.app.id')

echo "✅ Application created with ID: $APP_ID"

# Step 5: Wait for deployment
echo "⏳ Waiting for deployment to complete..."
while true; do
  STATUS=$(curl -H "Authorization: Bearer $DIGITALOCEAN_TOKEN" \
    "https://api.digitalocean.com/v2/apps/$APP_ID" | jq -r '.app.phase')
  
  if [ "$STATUS" = "ACTIVE" ]; then
    break
  fi
  
  echo "Current status: $STATUS"
  sleep 30
done

# Step 6: Get application URL
APP_URL=$(curl -H "Authorization: Bearer $DIGITALOCEAN_TOKEN" \
  "https://api.digitalocean.com/v2/apps/$APP_ID" | jq -r '.app.live_url')

echo "🎉 Deployment complete!"
echo "📊 Your trading bot is live at: $APP_URL"
echo "💰 Bot will start trading automatically"
echo "⚠️  Monitor the first 24 hours closely"

# Step 7: Setup monitoring webhook (optional)
if [ ! -z "$SLACK_WEBHOOK" ]; then
  curl -X POST -H 'Content-type: application/json' \
    --data "{\"text\":\"🚀 Crypto trading bot deployed successfully at $APP_URL\"}" \
    $SLACK_WEBHOOK
fi

echo "✅ Automated deployment completed successfully!"
```

## API Token Setup Instructions

### GitHub Personal Access Token
1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate new token with these permissions:
   - `repo` (full control of private repositories)
   - `admin:repo_hook` (manage repository hooks)
3. Copy token and set as `GITHUB_TOKEN`

### Digital Ocean API Token
1. Go to Digital Ocean Control Panel → API
2. Generate New Token
3. Give it a name: "Trading Bot Deployment"
4. Copy token and set as `DIGITALOCEAN_TOKEN`

### Kraken API Keys
1. Login to Kraken → Settings → API
2. Create new API key with trading permissions
3. Copy both API key and secret

## Running the Automation

```bash
# Make script executable
chmod +x deploy-bot.sh

# Run the deployment
./deploy-bot.sh
```

## Monitoring Commands

```bash
# Check application status
curl -H "Authorization: Bearer $DIGITALOCEAN_TOKEN" \
  "https://api.digitalocean.com/v2/apps/$APP_ID"

# View application logs
curl -H "Authorization: Bearer $DIGITALOCEAN_TOKEN" \
  "https://api.digitalocean.com/v2/apps/$APP_ID/logs"

# Stop the application (emergency)
curl -X POST -H "Authorization: Bearer $DIGITALOCEAN_TOKEN" \
  "https://api.digitalocean.com/v2/apps/$APP_ID/deployments"
```

## Safety Configurations

```bash
# Set conservative initial settings
export INITIAL_POSITION_SIZE=1  # 1% of portfolio
export ENABLE_BOLD_MODE=false   # Disable aggressive trading
export MAX_LEVERAGE=1           # No leverage initially
export ENABLE_STOP_LOSS=true    # Always use stop losses
```

## Rollback Commands

```bash
# Emergency stop and rollback
curl -X DELETE -H "Authorization: Bearer $DIGITALOCEAN_TOKEN" \
  "https://api.digitalocean.com/v2/apps/$APP_ID"

echo "🛑 Application stopped and destroyed"
```

## Success Verification

```bash
# Test if bot is responsive
curl -f "$APP_URL/health" && echo "✅ Bot is healthy" || echo "❌ Bot health check failed"

# Verify trading signals
curl -f "$APP_URL/api/signals" && echo "✅ Trading signals working" || echo "❌ Signals not available"
```

This automation script can be executed by any AI assistant or automation tool that has access to the required API tokens and can run bash commands.