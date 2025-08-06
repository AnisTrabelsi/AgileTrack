# AgileTrack

AgileTrack est une plateforme micro-services pour organiser et suivre vos projets agiles : gestion de tâches type **Kanban (To Do / Doing / Done)**, planification de sprints, suivi des tickets et analyse des performances en temps réel.

---

## 🚩 Fonctionnalités clés

* **Authentification JWT** : connexion sécurisée, rafraîchissement de jetons.  
* **Gestion des utilisateurs** : rôles & droits (PostgreSQL).  
* **Module Projets** : création et suivi des projets, dépôts et versions (FastAPI + MongoDB).  
* **Module Tâches** : gestion des tickets (To Do, Doing, Done), affectation aux membres, suivi en temps réel.  
* **Tableaux Kanban & Scrum** : visualisation intuitive de l’avancement des équipes.  
* **Métriques & Rapports** : temps de cycle, vélocité de sprint, burndown charts.  
* **Tableau de bord Web** : React 18 (Vite) + Tailwind (graphiques et vues interactives).  
* **Notifications** : intégration possible avec Slack / Email pour mises à jour automatiques.  
* **Surveillance** : Prometheus collecte les métriques des services, Grafana fournit les dashboards *(installation automatisée via Ansible)*.  
* **Pipeline CI/CD** : GitHub Actions → Build → Push GHCR → Déploiement (Terraform + `kubectl`).  

---

## ⚙️ Pile technologique

| Couche           | Outils principaux                                                   |
| ---------------- | ------------------------------------------------------------------- |
| Frontend         | React 18 · Vite · TailwindCSS                                       |
| Services         | Django (Auth) · FastAPI (Projects) · Node.js (Tasks) · Go (Metrics) |
| Bases de données | PostgreSQL · MongoDB · Redis · InfluxDB                             |
| Conteneurs       | Docker · Docker Compose                                             |
| Orchestration    | Kubernetes (k3d en local, **EKS** en prod)                          |
| Registry         | **GHCR** · *(ECR optionnel en prod)*                                |
| CI/CD            | Git & GitHub Actions (SonarCloud + Build & Push)                    |
| IaC              | Terraform · Ansible (`kubernetes.core.k8s`)                         |
| Monitoring       | Prometheus · Grafana *(déployés et configurés via Ansible)*         |

---

## 🚀 Lancer en **local** (Docker Compose)

```bash
git clone https://github.com/<votre-org>/AgileTrack.git
cd AgileTrack

# Lancer tous les services (Nexus & SonarQube si activés)
docker compose -f deploy/compose.yml up --build -d
```

| Service       | URL par défaut                  |
| ------------- | --------------------------------|
| Auth API      | http://localhost:8000           |
| Projects API  | http://localhost:8001           |
| Tasks API     | http://localhost:8002           |
| Prometheus    | http://localhost:9090           |
| Grafana       | http://localhost:3000 (admin/admin) |
| Nexus *(opt)* | http://localhost:8081           |

Arrêt & nettoyage :

```bash
docker compose -f deploy/compose.yml down -v
```

---

## ☸️ Déploiement **Kubernetes (local – k3d)**

<details>
<summary>Voir les étapes k3d</summary>

### 1) Cluster

```bash
k3d cluster create agiletrack --servers 1 --agents 2 -p "80:80@loadbalancer"
kubectl config use-context k3d-agiletrack
```

### 2) Pull-secret GHCR

```bash
kubectl apply -f deploy/k8s/base/namespaces.yaml

kubectl -n agiletrack create secret docker-registry image-pull-ghcr \
  --docker-server=ghcr.io \
  --docker-username=<gh-user> \
  --docker-password=<PAT> \
  --docker-email=<email>

kubectl -n agiletrack patch serviceaccount default -p \
  '{"imagePullSecrets":[{"name":"image-pull-ghcr"}]}'
```

### 3) Bases de données (Helm)

```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update

helm install auth-db      bitnami/postgresql -n agiletrack \
  --set auth.username=postgres,auth.password=postgres,auth.database=auth

helm install projects-db  bitnami/mongodb    -n agiletrack --set auth.enabled=false
helm install tasks-redis  bitnami/redis      -n agiletrack --set auth.enabled=false
helm install metrics-db   bitnami/influxdb2  -n agiletrack \
  --set adminUser.username=admin,adminUser.password=admin123,adminUser.token=dev-token
```

### 4) Applications

```bash
kubectl apply -f deploy/k8s/base/all-in-one.yaml
kubectl -n agiletrack get pods
```

### 5) Monitoring via Ansible

```bash
cd infra/ansible
ansible-playbook -i inventory.yml playbooks/monitoring.yml
```

*(Déploie Prometheus Operator + Grafana et configure les dashboards automatiquement.)*

</details>

---

## ☁️ Déploiement **production – AWS EKS**

### 🔑 Prérequis

| Ressource                            | Usage                    |
| ------------------------------------ | ------------------------ |
| Bucket S3 `agiletrack-tfstate-*`     | Fichier d’état Terraform |
| Table DynamoDB `agiletrack-tf-lock`  | Verrouillage état        |
| Rôle IAM **`gha-eks-deploy`** + OIDC | `id-token:write` pour CI |
| Secret GitHub `AWS_ROLE_TO_ASSUME`   | ARN du rôle ci-dessus    |

### 1) Infra (Terraform)

```bash
cd infra/terraform
terraform init
terraform apply -auto-approve

aws eks update-kubeconfig --name agiletrack-eks --region eu-west-3
```

### 2) Pipelines GitHub Actions

| Fichier workflow                    | Fonction                                |
| ----------------------------------- | --------------------------------------- |
| `.github/workflows/ci.yml`          | Tests + Sonar ⟶ Build & Push GHCR       |
| `.github/workflows/infra-plan.yml`  | `terraform plan` sur chaque PR          |
| `.github/workflows/infra-apply.yml` | `terraform apply` sur `main` (approval) |
| `.github/workflows/deploy-eks.yml`  | `kubectl apply` manifeste K8s           |

---

## 🔄 Pipeline **CI/CD**

| Étape                | Action GitHub         | Description                                |
| -------------------- | --------------------- | ------------------------------------------ |
| **Qualité**          | `ci.yml` (SonarCloud) | Tests React + analyse statique             |
| **Build & Push**     | `ci.yml`              | 5 images : SHA + `latest` sur **GHCR**     |
| **Plan/Apply Infra** | `infra-*.yml`         | Terraform (S3 state)                       |
| **Deploy App**       | `deploy-eks.yml`      | `kubectl apply` des manifests              |
| **Monitoring**       | `ansible-playbook`    | Déploiement Prometheus/Grafana via Ansible |

Secrets requis : `SONAR_TOKEN`, `AWS_ROLE_TO_ASSUME`.

---

## 🏗️ Composants **AWS** mobilisés

| Couche            | Services AWS / assoc.                                  |
| ----------------- | ------------------------------------------------------ |
| **Réseau**        | VPC, Subnets (3× AZ), IGW, NAT GW, SG                  |
| **Calcul**        | **EKS** 1.30 + Managed Nodes Spot                      |
| **Conteneurs**    | *(Registry externe : GHCR ; ECR optionnel)*            |
| **Stockage**      | S3 (tfstate), DynamoDB (lock)                          |
| **Sécurité**      | IAM Roles (cluster, nodes, OIDC GitHub) / KMS          |
| **Observabilité** | CloudWatch Logs + *(Prometheus/Grafana via Ansible)*   |
| **Exposition**    | ELB (Traefik) + Route 53/ACM (option)                  |

---

## 📂 Arborescence (racine)

```
frontend/                     # React
auth-service/                 # Django
projects-service/             # FastAPI
tasks-service/                # Node API + worker
metrics-service/              # Go /metrics
deploy/
  compose.yml                 # Stack locale
  k8s/base/
    all-in-one.yaml           # Namespace + Apps + Traefik
infra/
  terraform/                  # VPC, EKS, ECR, KMS
  ansible/                    # Playbooks (monitoring, day-2 ops)
.github/
  workflows/                  # CI / Terraform / Deploy
```

---

## 🧪 Quick check (EKS)

```bash
kubectl get nodes
kubectl -n agiletrack get pods
kubectl -n agiletrack port-forward svc/projects-service 8001:8001 &
curl http://localhost:8001/docs
```

---

## 🔥 Bonnes pratiques & suites

* Migrer les bases vers **services managés** (RDS, Atlas…).
* Externaliser les secrets avec **AWS Secrets Manager + External Secrets**.
* Ajouter des probes `/healthz`, HPA/KEDA.
* Helm Charts + GitOps (*Argo CD*).
* Affiner le rôle `gha-eks-deploy` (least privilege).
* Centraliser logs (ex. Loki) & traces (OTel).

Happy Shipping 🚀

