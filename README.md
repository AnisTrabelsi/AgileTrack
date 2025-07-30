# DevOpsTrack

DevOpsTrack est une **plateforme micro‑services** pour suivre des pipelines CI/CD, gérer des projets techniques et agréger des métriques d’exécution en temps réel.

---

## 🚩 Fonctionnalités clés

* **Authentification JWT** : connexion sécurisée, rafraîchissement de jetons.
* **Gestion des utilisateurs** : rôles & droits dans PostgreSQL.
* **Module Projets** : CRUD dépôts / environnements / versions (FastAPI + MongoDB).
* **Module Tâches** : file Redis simulant des jobs CI/CD, état en temps réel (API + worker).
* **Métriques & Logs** : exposition `/metrics` (Prometheus), stockage InfluxDB.
* **Tableau de bord Web** : React 18 (Vite) + Tailwind (graphique builds, état jobs).
* **Registry d’images** : **GHCR** (par défaut). *Nexus 3 reste optionnel en local via Compose.*
* **Surveillance** : Prometheus scrappe les services, Grafana propose des dashboards.
* **Pipeline CI/CD** : GitHub Actions → build → push GHCR → déploiement (Terraform + kubectl).

---

## ⚙️ Pile technologique

| Couche           | Outils principaux                                                   |
| ---------------- | ------------------------------------------------------------------- |
| Frontend         | React 18 · Vite · TailwindCSS                                       |
| Services         | Django (Auth) · FastAPI (Projects) · Node.js (Tasks) · Go (Metrics) |
| Bases de données | PostgreSQL · MongoDB · Redis · InfluxDB                             |
| Conteneurs       | Docker · Docker Compose                                             |
| Orchestration    | Kubernetes (k3d en local, **EKS** en prod)                          |
| Registry         | **GHCR** · *(Nexus 3 optionnel en local)*                           |
| CI/CD            | Git & GitHub Actions (SonarCloud + Build & Push)                    |
| IaC              | Terraform · Ansible (module `kubernetes.core.k8s`)                  |
| Monitoring       | Prometheus · Grafana                                                |

---

## 🚀 Lancer en **local** (Docker Compose)

```bash
# Cloner le dépôt
git clone https://github.com/<owner>/<repo>.git
cd <repo>

# Lancer les services (inclut Nexus & SonarQube si activés)
docker compose -f deploy/compose.yml up --build -d
```

**Accès rapides** :

* Auth API : [http://localhost:8000](http://localhost:8000)
* Projects API : [http://localhost:8001](http://localhost:8001)
* Tasks API : [http://localhost:8002](http://localhost:8002)
* Prometheus : [http://localhost:9090](http://localhost:9090)
* Grafana : [http://localhost:3000](http://localhost:3000) (admin / admin)
* *(Optionnel)* Nexus : [http://localhost:8081](http://localhost:8081)

> Arrêt & nettoyage : `docker compose -f deploy/compose.yml down -v`

---

## ☸️ Déploiement **Kubernetes — local (k3d)**

<details>
<summary>Clique pour les étapes k3d</summary>

### 1) Créer un cluster k3d

```bash
k3d cluster create devopstrack --servers 1 --agents 2 -p "80:80@loadbalancer"
kubectl config use-context k3d-devopstrack
kubectl get nodes
```

### 2) Préparer le namespace + pull secret GHCR

> Créer un **PAT** GitHub avec scope **`read:packages`**

```bash
kubectl apply -f deploy/k8s/base/namespaces.yaml

kubectl -n devopstrack create secret docker-registry image-pull-ghcr \
  --docker-server=ghcr.io \
  --docker-username=<github-username> \
  --docker-password=<PAT> \
  --docker-email=<email>

kubectl -n devopstrack patch serviceaccount default --type merge \
  -p '{"imagePullSecrets":[{"name":"image-pull-ghcr"}]}'
```

### 3) Installer les bases (Helm)

```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update

helm install auth-db bitnami/postgresql -n devopstrack \
  --set auth.username=postgres,auth.password=postgres,auth.database=auth

helm install projects-db bitnami/mongodb -n devopstrack --set auth.enabled=false

helm install tasks-redis bitnami/redis -n devopstrack --set auth.enabled=false

helm install metrics-db bitnami/influxdb2 -n devopstrack \
  --set adminUser.username=admin,adminUser.password=admin123,adminUser.token=dev-token,adminUser.organization=devopstrack,adminUser.bucket=metrics
```

### 4) Déployer les applications

```bash
kubectl apply -f deploy/k8s/base/apps/k8s-devopstrack-apps.yaml
```

</details>

---

## ☁️ Déploiement **production — AWS EKS**

### 🔑 Prérequis AWS

| Ressource                             | Commentaire                                             |
| ------------------------------------- | ------------------------------------------------------- |
| AWS Account                           | + IAM user/role avec droits administrateur              |
| Bucket S3 `devopstrack-tfstate-<id>`  | Stockage état Terraform                                 |
| Table DynamoDB `devopstrack-tf-lock`  | Verrouillage Terraform                                  |
| Rôle IAM OIDC **`DevOpsTrackGitHub`** | Trust Policy vers `token.actions.githubusercontent.com` |
| Secrets GitHub `AWS_ROLE_TO_ASSUME`   | ARN du rôle ci‑dessus                                   |

### 1) Provisionner l’infra (Terraform)

```bash
cd infra/terraform
terraform init
terraform plan
terraform apply -auto-approve

# Configure kubectl :
aws eks update-kubeconfig --name devopstrack-eks --region eu-west-3
```

### 2) CI/CD GitHub Actions

1. **`ci.yml`** : build, tests, push images GHCR.
2. **`infra-plan-apply.yml`** : plan sur PR ; apply sur `main`.
3. **`deploy-eks.yml`** : applique `deploy/k8s/base/all-in-one.yaml` dès qu’une image est poussée.

### 3) Déployer manuellement (si besoin)

```bash
kubectl apply -f deploy/k8s/base/all-in-one.yaml
kubectl -n devopstrack get pods
```

> Le fichier `all-in-one.yaml` crée le namespace `devopstrack`, les Secrets, Deployments, Services et l’IngressRoute Traefik ; il route `/projects`, `/tasks` et `/`.

---

## 🔄 Pipeline **CI/CD**

| Étape                | Action GitHub          | Description                                   |
| -------------------- | ---------------------- | --------------------------------------------- |
| **Qualité**          | `ci.yml` → SonarCloud  | Analyse code et tests unitaires               |
| **Build & Push**     | `ci.yml`               | Image `${{ github.sha }}` + `latest` sur GHCR |
| **Plan/Apply Infra** | `infra-plan-apply.yml` | Terraform plan (PR) / apply (main)            |
| **Deploy App**       | `deploy-eks.yml`       | `kubectl apply` du manifeste K8s              |

Secrets requis : `SONAR_TOKEN`, `AWS_ROLE_TO_ASSUME`.

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
      namespaces.yaml
      apps/
        k8s-devopstrack-apps.yaml
infra/
  terraform/
  ansible/
.github/
  workflows/
    ci.yml
    infra-plan-apply.yml
    deploy-eks.yml
```

---

## 🧪 Tests rapides (EKS)

```bash
kubectl get nodes
kubectl -n devopstrack get pods
kubectl -n devopstrack port-forward svc/projects-service 8001:8001
curl http://127.0.0.1:8001/docs
```

---

## 🏗️ Composants AWS mobilisés

| Couche               | Service AWS                      | Rôle précis dans l’architecture                                  |
| -------------------- | -------------------------------- | ---------------------------------------------------------------- |
| **Réseau**           | VPC                              | Isolation réseau (CIDR `10.0.0.0/16`).                           |
|                      | Subnets privés & publics         | 3 AZ (eu‑west‑3a/b/c). Privés : nœuds EKS. Publics : LB, NAT GW. |
|                      | Internet Gateway                 | Accès Internet subnets publics.                                  |
|                      | NAT Gateway                      | Sortie Internet des nœuds privés.                                |
|                      | Security Groups                  | Pare‑feu autour du control‑plane, des nœuds et du LB.            |
| **Calcul**           | EKS (Elastic Kubernetes Service) | Cluster Kubernetes 1.30 managé.                                  |
|                      | Managed Node Groups              | Nœuds EC2 `t3.medium`, autoscaling 2‑4.                          |
| **Stockage**         | S3                               | Bucket tfstate, éventuels backups.                               |
|                      | DynamoDB                         | Table `devopstrack-tf-lock` (lock state).                        |
|                      | ECR                              | Registre d’images `frontend`, `auth-service`, …                  |
| **Sécurité**         | IAM roles & policies             | Rôles cluster, nodes + OIDC GitHub.                              |
|                      | KMS                              | Chiffrement secrets Kubernetes.                                  |
| **Observabilité**    | CloudWatch Logs & Metrics        | Logs control‑plane & Container Insights.                         |
| **Réseau app**       | Elastic Load Balancer            | ALB/NLB provisionné via Traefik.                                 |
| **DNS/TLS (option)** | Route 53 + ACM                   | Domaine & certificats pour Traefik.                              |

**Pourquoi ces choix ?**

1. VPC multi‑AZ : haute dispo.
2. NAT GW unique : coût ↔ simplicité.
3. Managed Nodes : patching & autoscaling gérés.
4. ECR : latence min vers EKS.
5. S3 + DynamoDB backend : standard Terraform.
6. OIDC GitHub : pas de clés statiques.
7. KMS : chiffrement des secrets.
8. CloudWatch : journaux & alertes intégrés.
9. ELB automatisé par Traefik.

---

## ❗ Bonnes pratiques

* Utiliser des bases **managées** en prod (RDS, Atlas…).
* Stocker les secrets dans **AWS Secrets Manager** avec *External‑Secrets*.
* Ajouter des probes HTTP `/healthz` aux services.
* Activer HPA (ou KEDA) pour l’auto‑scaling.
