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

This repository implements a sophisticated CI/CD pipeline with multiple interconnected workflows providing comprehensive validation, security scanning, and automated deployment capabilities.

### **Primary Workflows**

#### **1. Unified CI Pipeline ([unified-ci-pipeline.yml](https://github.com/adamlevi87/project-7-app/actions/workflows/unified-ci-pipeline.yml)) - The Central Orchestrator**
**Purpose:** Primary entry point providing multiple execution paths based on different needs.

**Triggered By:**
- **Code pushes** to dev/staging/main branches (automatic)
- **Manual dispatch** via GitHub UI (controlled execution)
- **[CI - Step 0 - Base Image Management](#4-ci---step-0---base-image-management-base-image-managementyml---supply-chain-security--dependency-management)** (optionally, after Dockerfile updates)

**Key Intelligence:**
- **Code pushes** → Always run tests via CI - Step 1 - Tests and Validations
- **Manual triggers** → `skip_tests` defaults to TRUE for fast deployment when needed
- **Main branch merges** → Analyzes PR metadata to detect release PRs, triggers Auto Patch Release workflow for version tagging, then proceeds to deployment
- **Branch-aware behavior** → Auto-merge for dev/staging, manual approval for main

**Calls:**
- [CI - Step 1 - Tests and Validations](#2-ci---step-1---tests-and-validations-tests-and-validationsyml---the-comprehensive-validation-engine) (for push triggers or when tests not skipped)
- [Auto Patch Release](#6-auto-patch-release-auto-patch-releaseyml---automated-release-tagging) (for main branch merges)
- [CI - Step 2 - Application Build and Deploy to ECR](#3-ci---step-2---application-build-and-deploy-to-ecr-application-deployyml---the-deployment-engine) (for deployment)

#### **2. CI - Step 1 - Tests and Validations ([tests-and-validations.yml](https://github.com/adamlevi87/project-7-app/actions/workflows/tests-and-validations.yml)) - The Comprehensive Validation Engine**
**Purpose:** 6-stage comprehensive testing pipeline ensuring code quality and security.

**Triggered By:**
- **Unified CI Pipeline** (orchestrated execution)
- **Manual dispatch** (standalone comprehensive testing)

**6-Stage Pipeline:**
1. **Quality** - Lockfile validation, npm audit, linting, Dockerfile validation
2. **Testing** - Unit tests, integration tests, containerized testing
3. **Security** - Snyk, Trivy, Docker Scout, Semgrep (multi-layered security scanning)
4. **Container** - Dive analysis, structure tests, runtime validation
5. **Performance** - Performance baselines, compliance checks  
6. **Deployment** - Triggers CI - Step 2 - Application Build and Deploy to ECR (unless skipped)

**Calls:**
- [CI - Step 2 - Application Build and Deploy to ECR](#3-ci---step-2---application-build-and-deploy-to-ecr-application-deployyml---the-deployment-engine) (Stage 6, unless skipped)

#### **3. CI - Step 2 - Application Build and Deploy to ECR ([application-deploy.yml](https://github.com/adamlevi87/project-7-app/actions/workflows/application-deploy.yml)) - The Deployment Engine**
**Purpose:** Core deployment with smart ECR management and GitOps integration.

**Triggered By:**
- **Unified CI Pipeline** (orchestrated deployment)
- **CI - Step 1 - Tests and Validations** (Stage 6 deployment trigger)
- **Manual dispatch** (emergency/direct deployment)

**Three Action Modes:**
- **build-and-push** - Smart build with content deduplication
- **update-digest-only** - Skip building, update GitOps with existing digest
- **force-rebuild** - Force build regardless of changes

**Key Features:**
- **Content Hash Deduplication** - SHA256-based smart building (only builds if content changed)
- **Smart ECR Management** - Multiple tagging strategies, existence checks
- **Security Integration** - Cosign signing, SBOM generation, provenance attestation
- **GitOps Automation** - Creates PRs in GitOps repo, auto-merges for dev/staging, manual approval for main

**Calls:**
- GitOps repository workflows (via API calls for PR creation and auto-merge)

---

### **Supporting Workflows**

#### **4. CI - Step 0 - Base Image Management ([base-image-management.yml](https://github.com/adamlevi87/project-7-app/actions/workflows/base-image-management.yml)) - Supply Chain Security & Dependency Management**
**Purpose:** Comprehensive base image management with supply chain security verification and private registry caching.

**Triggered By:**
- **Manual dispatch only** (controlled dependency updates)

**Advanced Capabilities:**
- **Supply Chain Security** - Content Trust verification, specific manifest pinning
- **Private Registry Caching** - Re-tags and pushes verified images to private Docker Hub
- **Dockerfile Automation** - Updates all Dockerfile FROM statements to use private registry
- **Version Resolution** - Smart version management (latest tags, specified versions, auto-generation)
- **PR Integration** - Creates Dockerfile update PRs, optional CI triggering

**Calls:**
- [Unified CI Pipeline](#1-unified-ci-pipeline-unified-ci-pipelineyml---the-central-orchestrator) (optionally, after Dockerfile updates)

#### **5. Manual Release ([manual-release.yml](https://github.com/adamlevi87/project-7-app/actions/workflows/manual-release.yml)) - Controlled Branch Promotion & Versioning**
**Purpose:** Human-controlled workflow for promoting changes between branches with proper version management.

**Triggered By:**
- **Manual dispatch only** (human-controlled releases)

**Capabilities:**
- **Branch Promotion** - `dev → staging` or `staging → main`
- **Version Management** - Major or minor version bumps (when targeting main)
- **Smart Automation** - Auto-merges to staging, manual review required for main
- **Release Preparation** - Creates release PRs with proper metadata for Auto Patch Release

**Calls:**
- No direct workflow calls (creates PRs that trigger other workflows when merged)

#### **6. Auto Patch Release ([auto-patch-release.yml](https://github.com/adamlevi87/project-7-app/actions/workflows/auto-patch-release.yml)) - Automated Release Tagging**
**Purpose:** Automatic release creation and tagging system triggered after main branch changes.

**Triggered By:**
- **Unified CI Pipeline** (automatically after main branch merges)

**Intelligence Features:**
- **Release Detection** - Analyzes PR metadata to determine if it came from Manual Release
- **Dual Strategy** - Uses planned versions for manual releases, auto-bumps patch for others
- **Git Tag Creation** - Creates and pushes version tags
- **GitHub Release** - Generates release notes and publishes releases

**Calls:**
- No other workflows (terminal workflow in release process)

---

### **Complete Flow Patterns**

#### **Pattern 1: Standard Development (Automatic)**
```
Code Push → Unified CI Pipeline → Tests & Validations → Application Deploy → GitOps PR → Auto-merge
```
**Time:** ~15-20 minutes | **Use:** Normal development workflow with full validation

#### **Pattern 2: Fast Deployment (Manual)**
```
Manual → Unified CI Pipeline (skip_tests=true) → Application Deploy → GitOps PR
```
**Time:** ~3-5 minutes | **Use:** Hotfixes, emergency deployments

#### **Pattern 3: Comprehensive Testing (Manual)**
```
Manual → Tests & Validations (full 6-stage pipeline) → Application Deploy
```
**Time:** ~15-20 minutes | **Use:** Standalone testing without orchestration, pre-release validation

#### **Pattern 4: Controlled Feature Release**
```
Manual → Manual Release (dev→staging) → Auto-merge → Unified CI Pipeline → Auto Patch Release (v1.2.3)
Manual → Manual Release (staging→main, minor) → Manual Review → Unified CI Pipeline → Auto Patch Release (v1.3.0)
```
**Use:** Structured feature releases with proper versioning

#### **Pattern 5: Supply Chain Management**
```
Manual → Base Image Management → Dockerfile PR → (Optional) Unified CI Pipeline trigger
```
**Use:** Security updates, dependency management

#### **Pattern 6: Emergency/Direct Deployment**
```
Manual → Application Deploy (direct) → GitOps PR
```
**Time:** ~3-5 minutes | **Use:** Bypass all validation for critical fixes

---

### **Requirements Summary**

#### **Infrastructure (Automatically provisioned by Terraform):**
- **AWS IAM Role** - OIDC-configured for ECR access
- **ECR Repository** - Container image storage
- **GitOps Repository** - ArgoCD deployment manifests
- **OIDC Provider** - AWS integration for secure authentication

#### **Repository Configuration (Automatically set by Terraform):**
- **Variables** - AWS region, ECR URLs, GitOps repo references
- **Secrets** - AWS role ARNs, GitHub PAT tokens for GitOps integration
- **Permissions** - ECR access policies, cross-repository workflow triggers

#### **Manual Setup Required:**
- **Docker Hub Account** - Private registry for base image caching
  - `DOCKER_HUB_USERNAME` and `DOCKER_HUB_PASSWORD` secrets (must be set manually)
- **Snyk Token** - Dependency vulnerability scanning
  - `SNYK_TOKEN` secret (must be set manually)
- **Cosign** - Container image signing (automatically installed in workflows)

**Note:** The core infrastructure, repository secrets, and variables are all handled automatically by the [project-7-tf](https://github.com/adamlevi87/project-7-tf) Terraform deployment. Only the external service accounts (Docker Hub, Snyk) require manual setup.

This architecture provides exceptional flexibility - from rapid development iteration to comprehensive quality gates, emergency response capabilities, and enterprise-grade release management - all while maintaining security, traceability, and operational excellence.

---

*This application serves as a practical example of enterprise DevOps transformation - taking simple developer code and making it production-ready through proper CI/CD validation, security hardening, and operational excellence.*
