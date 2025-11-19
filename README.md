# Project-7-App: "It Works On My Machine" → Production-Ready

> 📋 **For complete project overview and context, see [project-7-overview](https://github.com/adamlevi87/project-7-overview)**

This repository contains a Node.js Express microservice that demonstrates the transformation from a simple "it works on my machine" application into a production-ready, CI/CD-validated system with comprehensive testing, security, and monitoring.

## Technology Stack

- **Language**: Node.js 18
- **Framework**: Express.js 5.x
- **Testing**: Jest with Supertest
- **Security**: CSRF protection, cookie parsing, session management
- **Container**: Docker (Alpine-based)

## Project Origins & Story

### The Original Code
This project began with the `original_it-works-on-my-machine` folder - a minimal Express application provided by a developer with the classic statement: *"It works perfectly on my local machine!"*

The original application contained:
- Basic Express server with a single `/health` endpoint
- Simple Dockerfile
- Minimal package.json with basic dependencies
- No tests, security measures, or production considerations

### The Transformation Journey
The complete story of transforming this application is documented in:
**[Conversation between a DevOps Engineer and the Developer](https://adamlevi87.github.io/project-7-app/conversation_between_a_Devops_Engineer_and_the_Developer.html)**

This conversation captures the real-world challenges of taking developer code through enterprise CI/CD validation:

- **Stage 1: Code Quality** - Lockfile registry issues, dependency management
- **Stage 2: Testing** - Adding Jest tests, proper module exports
- **Stage 3: Security** - CVE scanning, CSRF protection implementation  
- **Stage 4: Container Validation** - Docker best practices, image optimization
- **Stage 5: Performance & Compliance** - Resource baselines, monitoring setup

The conversation shows the iterative process of identifying issues, implementing fixes, and validating changes - a typical DevOps/Developer collaboration.

### Current State
The `it-works-on-my-machine` folder now contains the production-ready version with:
- ✅ **Security**: CSRF protection, secure cookie handling
- ✅ **Testing**: Comprehensive Jest test suite
- ✅ **Monitoring**: Health check endpoints with configurable states
- ✅ **Production**: Graceful shutdown, proper error handling
- ✅ **Container**: Optimized Docker configuration
- ✅ **CI/CD**: Full validation pipeline compatibility

## Repository Initialization

This repository is automatically configured by the [project-7-tf](https://github.com/adamlevi87/project-7-tf) Terraform infrastructure during normal deployment (via the `repo_secrets` module).

### Automated Setup Includes:
- **Repository Variables**: ECR registry URLs, environment configurations, GitOps repository references
- **Repository Secrets**: GitHub tokens, AWS IAM role ARNs for ECR access
- **OIDC Integration**: AWS roles for secure GitHub Actions authentication
- **ECR Access Permissions**: IAM policies for pushing/pulling container images

**Note:** Repository configuration (secrets/variables) happens during standard infrastructure deployment, while `bootstrap_mode` controls whether to trigger the application repository's `base-image-management.yml` workflow.

### Variables Set by Terraform:
```
AWS_REGION_TF_DEV = us-east-1
GITOPS_REPO_TF_DEV = adamlevi87/project-7-gitops
```

### Secrets Set by Terraform:
```
AWS_ROLE_TO_ASSUME_TF_DEV = arn:aws:iam::123456789012:role/project-7-dev-app-ecr-access
ECR_REPOSITORY_FRONTEND_TF_DEV = 123456789012.dkr.ecr.us-east-1.amazonaws.com/project-7-dev-welcome
TOKEN_GITHUB_TF_DEV = github_pat_...
```

## Application Details

### Endpoints
- `GET /health` - Health check endpoint (returns status based on application state)
- `GET /disable-health` - Utility endpoint to simulate unhealthy state (CSRF protected)
- `GET /csrf-token` - Provides CSRF token for protected endpoints

### Security Features
- **CSRF Protection**: All state-changing endpoints require valid CSRF tokens
- **Session Management**: Secure session configuration for ALB + Kubernetes
- **Cookie Security**: httpOnly, sameSite strict configuration
- **Graceful Shutdown**: Proper SIGTERM/SIGINT handling

### Testing
Comprehensive test suite covering:
- Health endpoint functionality
- Security middleware validation  
- Error condition handling
- CSRF token validation

## Local Development

### Setup
```bash
# Install dependencies
npm ci

# Run tests
npm test

# Start development server
npm start
```

### Docker Development
```bash
# Build image
docker build -t it-works-on-my-machine .

# Run container
docker run -p 3000:3000 it-works-on-my-machine
```

## GitHub Workflows

*[Detailed workflow documentation will be added in the next phase]*

The repository includes several sophisticated workflows for:
- Application building and testing
- Security scanning and validation
- ECR image management with content-based tagging
- GitOps integration for automated deployments
- Cross-repository workflow orchestration

---

*This application serves as a practical example of enterprise DevOps transformation - taking simple developer code and making it production-ready through proper CI/CD validation, security hardening, and operational excellence.*
