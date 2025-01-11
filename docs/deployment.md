# CryOutNow Deployment Guide

This guide provides step-by-step instructions for deploying the CryOutNow application.

## Prerequisites

Before deploying, ensure you have:

- Node.js (v16 or higher)
- PostgreSQL (v14 or higher)
- Git
- Vercel CLI (for frontend deployment)
- Heroku CLI (for backend deployment)
- Environment variables configured

## Backend Deployment (Heroku)

### 1. Initial Setup

```bash
# Login to Heroku
heroku login

# Create a new Heroku app
heroku create cryoutnow-api

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:hobby-dev
```

### 2. Environment Configuration

Set up the following environment variables in Heroku:

```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your_jwt_secret
heroku config:set GOOGLE_CLIENT_ID=your_google_client_id
heroku config:set GOOGLE_CLIENT_SECRET=your_google_client_secret
heroku config:set FRONTEND_URL=https://your-frontend-url.com
```

### 3. Database Migration

```bash
# Run migrations on Heroku
heroku run npm run migrate
```

### 4. Deployment

```bash
# Deploy to Heroku
git push heroku main

# Ensure the app is running
heroku ps:scale web=1
```

### 5. SSL Configuration

```bash
# Enable SSL
heroku features:enable http-ssl
```

## Frontend Deployment (Vercel)

### 1. Initial Setup

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login
```

### 2. Environment Configuration

Create a `.env.production` file:

```env
REACT_APP_API_URL=https://your-backend-url.com
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
```

### 3. Build and Deploy

```bash
# Build the project
npm run build

# Deploy to Vercel
vercel --prod
```

## Post-Deployment Checklist

### Security
- [ ] Enable CORS with proper origin configuration
- [ ] Configure rate limiting
- [ ] Enable security headers
- [ ] Set up SSL/TLS
- [ ] Configure secure cookie settings

### Monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Configure performance monitoring
- [ ] Set up logging
- [ ] Enable automated alerts

### Backup
- [ ] Configure database backups
- [ ] Set up automated backup testing
- [ ] Document backup restoration process

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   ```bash
   # Check database connection
   heroku pg:info
   ```

2. **Application Errors**
   ```bash
   # View logs
   heroku logs --tail
   ```

3. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check for environment variables

## Maintenance

### Regular Tasks

1. **Database Maintenance**
   ```bash
   # Run database vacuum
   heroku pg:vacuum
   ```

2. **Updates**
   ```bash
   # Update dependencies
   npm update
   ```

3. **Monitoring**
   ```bash
   # Check application metrics
   heroku metrics:web
   ```

## Rollback Procedures

### Backend Rollback

```bash
# View release history
heroku releases

# Rollback to previous version
heroku rollback v{version_number}
```

### Frontend Rollback

```bash
# List deployments
vercel ls

# Rollback to previous deployment
vercel rollback
```

## Additional Resources

- [Heroku Documentation](https://devcenter.heroku.com/)
- [Vercel Documentation](https://vercel.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Node.js Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)

## Support

For deployment issues:
1. Check the application logs
2. Review error tracking system
3. Contact the development team
4. Submit an issue in the project repository 