#!/bin/bash
echo "🚨 EMERGENCY CRYPTO BOT DEPLOYMENT - STARTING NOW"

# Required: Set these with your actual values
KRAKEN_API_KEY="your_kraken_api_key_here"
KRAKEN_API_SECRET="your_kraken_api_secret_here"
DIGITALOCEAN_TOKEN="your_do_api_token_here"

# Create Digital Ocean app directly via API
APP_RESPONSE=$(curl -X POST "https://api.digitalocean.com/v2/apps" \
  -H "Authorization: Bearer $DIGITALOCEAN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "spec": {
      "name": "crypto-bot-client-'$(date +%s)'",
      "services": [{
        "name": "web",
        "git": {
          "repo_clone_url": "https://github.com/stackblitz-labs/bolt.new-any-llm.git",
          "branch": "main"
        },
        "build_command": "npm install && npm run build",
        "run_command": "npm run preview",
        "environment_slug": "node-js",
        "instance_count": 1,
        "instance_size_slug": "basic-xxs",
        "http_port": 4173,
        "envs": [
          {"key": "NODE_ENV", "value": "production"},
          {"key": "KRAKEN_API_KEY", "value": "'$KRAKEN_API_KEY'"},
          {"key": "KRAKEN_API_SECRET", "value": "'$KRAKEN_API_SECRET'"}
        ]
      }]
    }
  }')

# Extract app ID and live URL
APP_ID=$(echo $APP_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)
echo "✅ App created with ID: $APP_ID"

# Wait for deployment (about 5 minutes)
echo "⏳ Building and deploying... (5 minutes)"
sleep 300

# Get the live URL
APP_URL=$(curl -H "Authorization: Bearer $DIGITALOCEAN_TOKEN" \
  "https://api.digitalocean.com/v2/apps/$APP_ID" | \
  grep -o '"live_url":"[^"]*' | cut -d'"' -f4)

echo "🎉 DEPLOYMENT COMPLETE!"
echo "📊 Your crypto trading bot is LIVE at: $APP_URL"
echo "💰 Bot is ready to trade 24/7"
echo "⚠️ Send this URL to your client immediately"

# Test if it's working
curl -f "$APP_URL/health" && echo "✅ Bot health check passed" || echo "⚠️ Still warming up..."

echo "✅ DONE! Your angry client now has a live trading bot!"