# DevOpsTrack

DevOpsTrack est une **plateforme micro‑services** pour suivre des pipelines CI/CD, gérer des projets techniques et agréger des métriques d’exécution en temps réel.

---

## 🚩 Fonctionnalités clés

* **Authentification JWT** : connexion sécurisée, rafraîchissement de jetons.  
* **Gestion des utilisateurs** : rôles & droits (PostgreSQL).  
* **Module Projets** : CRUD dépôts / environnements / versions (FastAPI + MongoDB).  
* **Module Tâches** : file Redis simulant des jobs CI/CD, état en temps réel (API + worker).  
* **Métriques & Logs** : endpoint `/metrics` (Prometheus), stockage InfluxDB.  
* **Tableau de bord Web** : React 18 (Vite) + Tailwind (graphiques builds & jobs).  
* **Registry d’images** : **GHCR** (par défaut) – *Nexus 3 optionnel via Compose.*  
* **Surveillance** : Prometheus scrappe les services, Grafana fournit les dashboards.  
* **Pipeline CI/CD** : GitHub Actions → Build → Push GHCR → Déploiement (Terraform + `kubectl`).  

---

## ⚙️ Pile technologique

| Couche           | Outils principaux                                                   |
| ---------------- | ------------------------------------------------------------------- |
| Frontend         | React 18 · Vite · TailwindCSS                                       |
| Services         | Django (Auth) · FastAPI (Projects) · Node.js (Tasks) · Go (Metrics) |
| Bases de données | PostgreSQL · MongoDB · Redis · InfluxDB                             |
| Conteneurs       | Docker · Docker Compose                                             |
| Orchestration    | Kubernetes (k3d en local, **EKS** en prod)                          |
| Registry         | **GHCR** · *(Nexus 3 optionnel en local)*                           |
| CI/CD            | Git & GitHub Actions (SonarCloud + Build & Push)                    |
| IaC              | Terraform · Ansible (`kubernetes.core.k8s`)                         |
| Monitoring       | Prometheus · Grafana                                                |

---

## 🚀 Lancer en **local** (Docker Compose)

```bash
git clone https://github.com/<owner>/<repo>.git
cd <repo>

# Lancer tous les services (Nexus & SonarQube si activés)
docker compose -f deploy/compose.yml up --build -d
```

| Service        | URL par défaut                                                 |
| -------------- | -------------------------------------------------------------- |
| Auth API       | [http://localhost:8000](http://localhost:8000)                 |
| Projects API   | [http://localhost:8001](http://localhost:8001)                 |
| Tasks API      | [http://localhost:8002](http://localhost:8002)                 |
| Prometheus     | [http://localhost:9090](http://localhost:9090)                 |
| Grafana        | [http://localhost:3000](http://localhost:3000) (admin / admin) |
| Nexus (option) | [http://localhost:8081](http://localhost:8081)                 |

Arrêt & nettoyage :

```bash
docker compose -f deploy/compose.yml down -v
```

---

## ☸️ Déploiement **Kubernetes (local – k3d)**

<details>
<summary>Voir les étapes k3d</summary>

### 1) Cluster

```bash
k3d cluster create devopstrack --servers 1 --agents 2 -p "80:80@loadbalancer"
kubectl config use-context k3d-devopstrack
```

### 2) Pull‑secret GHCR

```bash
kubectl apply -f deploy/k8s/base/namespaces.yaml

kubectl -n devopstrack create secret docker-registry image-pull-ghcr \
  --docker-server=ghcr.io \
  --docker-username=<gh-user> \
  --docker-password=<PAT> \
  --docker-email=<email>

kubectl -n devopstrack patch serviceaccount default -p \
  '{"imagePullSecrets":[{"name":"image-pull-ghcr"}]}'
```

### 3) Bases de données (Helm)

```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update

helm install auth-db      bitnami/postgresql -n devopstrack \
  --set auth.username=postgres,auth.password=postgres,auth.database=auth

helm install projects-db  bitnami/mongodb    -n devopstrack --set auth.enabled=false
helm install tasks-redis  bitnami/redis      -n devopstrack --set auth.enabled=false
helm install metrics-db   bitnami/influxdb2  -n devopstrack \
  --set adminUser.username=admin,adminUser.password=admin123,adminUser.token=dev-token
```

### 4) Applications

```bash
kubectl apply -f deploy/k8s/base/all-in-one.yaml
kubectl -n devopstrack get pods
```

</details>

---

## ☁️ Déploiement **production – AWS EKS**

### 🔑 Prérequis

| Ressource                                   | Usage                    |
| ------------------------------------------- | ------------------------ |
| Bucket S3 `devopstrack-tfstate-*`           | Fichier d’état Terraform |
| Table DynamoDB `devopstrack-tf-lock`        | Verrouillage état        |
| Rôle IAM **`gha-eks-deploy`** + OIDC GitHub | `id-token:write` pour CI |
| Secrets GitHub `AWS_ROLE_TO_ASSUME`         | ARN du rôle ci‑dessus    |

### 1) Infra (Terraform)

```bash
cd infra/terraform
terraform init
terraform apply -auto-approve

aws eks update-kubeconfig --name devopstrack-eks --region eu-west-3
```

### 2) Pipelines GitHub Actions

| Fichier workflow                    | Fonction                          |
| ----------------------------------- | --------------------------------- |
| `.github/workflows/ci.yml`          | Tests + Sonar ⟶ Build & Push GHCR |
| `.github/workflows/infra-plan.yml`  | `terraform plan` sur PR           |
| `.github/workflows/infra-apply.yml` | `terraform apply` sur `main`      |
| `.github/workflows/deploy-eks.yml`  | `kubectl apply` manifeste K8s     |

---

## 🔄 Pipeline **CI/CD**

| Étape                | Action GitHub         | Description                            |
| -------------------- | --------------------- | -------------------------------------- |
| **Qualité**          | `ci.yml` (SonarCloud) | Tests React + analyse statique         |
| **Build & Push**     | `ci.yml`              | 5 images : SHA + `latest` sur **GHCR** |
| **Plan/Apply Infra** | `infra‑*.yml`         | Terraform (S3 state)                   |
| **Deploy App**       | `deploy-eks.yml`      | `kubectl apply` des manifests          |

Secrets requis : `SONAR_TOKEN`, `AWS_ROLE_TO_ASSUME`, `PAT_GHCR` *(si besoin)*.

---

## 🏗️ Composants **AWS** mobilisés

| Couche            | Services AWS                                 |
| ----------------- | -------------------------------------------- |
| **Réseau**        | VPC, Subnets (3× AZ), IGW, NAT GW, SG        |
| **Calcul**        | **EKS** 1.30 + Managed Nodes Spot            |
| **Conteneurs**    | **ECR** (6 repositories)                     |
| **Stockage**      | S3 (tfstate), DynamoDB (lock)                |
| **Sécurité**      | IAM Roles (cluster, nodes, OIDC GitHub), KMS |
| **Observabilité** | CloudWatch Logs                              |
| **Exposition**    | ELB (Traefik) + Route 53/ACM (option)        |

---

## 📂 Arborescence

```
frontend/
auth-service/
projects-service/
tasks-service/
metrics-service/
deploy/
  compose.yml
  k8s/
    base/
      all-in-one.yaml
infra/
  terraform/
  ansible/
.github/
  workflows/
    ci.yml
    infra.yml
    deploy-eks.yml
```

---

## 🧪 Quick check (EKS)

```bash
kubectl get nodes
kubectl -n devopstrack get pods
kubectl -n devopstrack port-forward svc/projects-service 8001:8001 &
curl http://localhost:8001/docs
```

---

## ❗ Bonnes pratiques & suites

* Migrer les bases vers **services managés** (RDS, Atlas, ElastiCache).
* Externaliser les secrets via **AWS Secrets Manager + External‑Secrets**.
* Ajouter des probes `/healthz` et activer HPA/KEDA.
* Passer les manifests en **Helm Charts** puis GitOps (*Argo CD*).
* Durcir le rôle `gha‑eks‑deploy` (least privilege).
* Centraliser logs & traces (Loki + Grafana Tempo).

Happy Shipping 🚀

