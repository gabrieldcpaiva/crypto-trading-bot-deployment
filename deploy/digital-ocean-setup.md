# Digital Ocean Deployment Guide

## 🚀 Quick Deploy to Digital Ocean App Platform

### Prerequisites
- Digital Ocean account
- doctl CLI installed and configured
- Git repository with your bot code

### Method 1: One-Click Deploy via App Platform

1. **Fork this repository** to your GitHub account

2. **Create App on Digital Ocean**:
   - Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
   - Click "Create App"
   - Connect your GitHub repository
   - Select this repo and main branch

3. **Configure Environment Variables**:
   ```
   KRAKEN_API_KEY=your_kraken_api_key_here
   KRAKEN_API_SECRET=your_kraken_api_secret_here
   NODE_ENV=production
   ```

4. **Deploy**:
   - Review settings and click "Create Resources"
   - App will build and deploy automatically
   - Get your live URL (e.g., `https://your-bot-name.ondigitalocean.app`)

### Method 2: CLI Deploy

1. **Install doctl**:
   ```bash
   # macOS
   brew install doctl
   
   # Linux
   snap install doctl
   
   # Windows (Chocolatey)
   choco install doctl
   ```

2. **Authenticate**:
   ```bash
   doctl auth init
   ```

3. **Deploy**:
   ```bash
   npm run deploy:do
   ```

### Method 3: Droplet Deployment (Advanced)

For full control and custom configurations:

1. **Create Droplet**:
   ```bash
   doctl compute droplet create trading-bot \
     --image ubuntu-20-04-x64 \
     --size s-1vcpu-1gb \
     --region nyc1 \
     --ssh-keys your-ssh-key-id
   ```

2. **Setup Docker**:
   ```bash
   # SSH into droplet
   ssh root@your-droplet-ip
   
   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   
   # Install Docker Compose
   curl -L "https://github.com/docker/compose/releases/download/v2.12.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   chmod +x /usr/local/bin/docker-compose
   ```

3. **Deploy with Docker**:
   ```bash
   # Clone your repo
   git clone https://github.com/your-username/bold-crypto-trading-bot.git
   cd bold-crypto-trading-bot
   
   # Set environment variables
   echo "KRAKEN_API_KEY=your_key_here" > .env
   echo "KRAKEN_API_SECRET=your_secret_here" >> .env
   
   # Start the bot
   docker-compose up -d
   ```

## 📊 Monitoring & Maintenance

### Health Checks
- App Platform automatically monitors your app
- Custom health endpoint: `/health`
- Restart policy: Always restart on failure

### Logs
```bash
# App Platform logs
doctl apps logs your-app-id

# Docker logs
docker-compose logs -f trading-bot
```

### Scaling
```bash
# Scale up workers
doctl apps update your-app-id --spec .do/app.yaml
```

### SSL/HTTPS
- Automatic SSL certificates via Let's Encrypt
- Custom domain support available

## 💰 Pricing

### App Platform Pricing
- **Basic**: $5/month (512MB RAM, 1 vCPU)
- **Professional**: $12/month (1GB RAM, 1 vCPU)
- **Work**: $25/month (2GB RAM, 2 vCPU)

### Database Add-ons
- **Dev Database**: $7/month (PostgreSQL)
- **Basic Database**: $15/month (1GB RAM)

### Recommended Setup
For a production trading bot:
- **Professional App** ($12/month)
- **Basic Database** ($15/month)
- **Total**: ~$27/month

## 🔧 Configuration

### Environment Variables

Required:
```
KRAKEN_API_KEY=your_actual_api_key
KRAKEN_API_SECRET=your_actual_api_secret
```

Optional:
```
NODE_ENV=production
LOG_LEVEL=info
TRADING_FREQUENCY=5
MAX_POSITION_SIZE=10
ENABLE_BOLD_MODE=false
ENABLE_MARTINGALE=false
MAX_LEVERAGE=1
```

### Database Schema
Automatic migrations will create:
- `trades` table for trade history
- `positions` table for current positions
- `bot_config` table for strategy settings
- `alerts` table for notifications

## 🚨 Security Best Practices

1. **API Key Security**:
   - Use environment variables only
   - Enable IP restrictions in Kraken
   - Limit API permissions to trading only

2. **Network Security**:
   - Use HTTPS only
   - Enable DDoS protection
   - Restrict database access

3. **Monitoring**:
   - Set up alerts for unusual activity
   - Monitor API usage limits
   - Track performance metrics

## 🆘 Troubleshooting

### Common Issues

1. **Build Failures**:
   ```bash
   # Check build logs
   doctl apps logs your-app-id --type=build
   ```

2. **Runtime Errors**:
   ```bash
   # Check runtime logs
   doctl apps logs your-app-id --type=run
   ```

3. **API Connection Issues**:
   - Verify API keys are correct
   - Check Kraken API status
   - Ensure proper rate limiting

### Support Resources
- [DigitalOcean Documentation](https://docs.digitalocean.com/)
- [App Platform Troubleshooting](https://docs.digitalocean.com/products/app-platform/how-to/troubleshoot-apps/)
- [Kraken API Documentation](https://docs.kraken.com/rest/)

## 🔄 Updates & Maintenance

### Auto-Deploy from Git
- App Platform automatically deploys on git push
- Enable auto-deploy in app settings
- Use staging branches for testing

### Manual Updates
```bash
# Update app configuration
doctl apps update your-app-id --spec .do/app.yaml

# Restart app
doctl apps restart your-app-id
```

### Backup Strategy
- Database automated backups included
- Export trade data regularly
- Store API keys securely (1Password, etc.)

---

🚨 **IMPORTANT**: This is a real trading bot that will execute actual trades when properly configured. Start with small amounts and paper trading to test your strategies!