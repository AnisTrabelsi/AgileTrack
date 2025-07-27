
# DevOpsTrack

DevOpsTrack est une **plateforme micro‑services** pour suivre des pipelines CI/CD, gérer des projets techniques et agréger des métriques d’exécution en temps réel.

---

## 🚩 Fonctionnalités clés

* **Authentification JWT** : connexion sécurisée, rafraîchissement de jetons.
* **Gestion des utilisateurs** : rôles & droits dans PostgreSQL.
* **Module Projets** : CRUD dépôts / environnements / versions (FastAPI + MongoDB).
* **Module Tâches** : file Redis simulant des jobs CI/CD, état en temps réel (API + worker).
* **Métriques & Logs** : exposition `/metrics` (Prometheus), stockage InfluxDB.
* **Tableau de bord Web** : React 18 (Vite) + Tailwind (graphique builds, état jobs).
* **Registry d’images** : **GHCR** (par défaut). *Nexus 3 reste optionnel en local via Compose.*
* **Surveillance** : Prometheus scrappe les services, Grafana propose des dashboards.
* **Pipeline CI/CD** : GitHub Actions → build → push GHCR → déploiement (Terraform + Ansible/K8s).

---

## ⚙️ Pile technologique

| Couche           | Outils principaux                                                     |
| ---------------- | --------------------------------------------------------------------- |
| Frontend         | React 18 · Vite · TailwindCSS                                         |
| Services         | Django (Auth) · FastAPI (Projects) · Node.js (Tasks) · Go (Metrics)   |
| Bases de données | PostgreSQL · MongoDB · Redis · InfluxDB                               |
| Conteneurs       | Docker · Docker Compose                                               |
| Orchestration    | Kubernetes (k3d en local, EKS en prod)                                |
| Registry         | **GHCR** (GitHub Container Registry) · *(Nexus 3 optionnel en local)* |
| CI/CD            | Git & GitHub Actions (SonarCloud + Build & Push)                      |
| IaC              | Terraform · Ansible                                                   |
| Monitoring       | Prometheus · Grafana                                                  |

---

## 🚀 Lancer en **local** (Docker Compose)

```bash
# Cloner le dépôt
git clone https://github.com/<owner>/<repo>.git
cd <repo>

# Lancer les services (peut inclure Nexus & SonarQube en option)
docker compose -f deploy/compose.yml up --build -d
```

**Accès rapides :**

- Auth API : http://localhost:8000  
- Projects API : http://localhost:8001  
- Tasks API : http://localhost:8002  
- Prometheus : http://localhost:9090  
- Grafana : http://localhost:3000 (admin / admin)  
- *(Optionnel)* Nexus : http://localhost:8081  

> Arrêt & nettoyage : `docker compose -f deploy/compose.yml down -v`

---

## ☸️ Déploiement **Kubernetes** (k3d)

### 1) Créer un cluster k3d

```bash
k3d cluster create devopstrack --servers 1 --agents 2 -p "80:80@loadbalancer"
kubectl config use-context k3d-devopstrack
kubectl get nodes
```

### 2) Préparer le namespace + pull secret GHCR

> Créer un **PAT** GitHub avec scope **`read:packages`**

```bash
kubectl apply -f deploy/k8s/base/namespaces.yaml

kubectl -n devopstrack create secret docker-registry image-pull-ghcr   --docker-server=ghcr.io   --docker-username=<github-username>   --docker-password=<PAT>   --docker-email=<email>

kubectl -n devopstrack patch serviceaccount default --type merge   -p '{"imagePullSecrets":[{"name":"image-pull-ghcr"}]}'
```

### 3) Installer les bases (Helm)

```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update

helm install auth-db bitnami/postgresql -n devopstrack   --set auth.username=postgres,auth.password=postgres,auth.database=auth

helm install projects-db bitnami/mongodb -n devopstrack   --set auth.enabled=false

helm install tasks-redis bitnami/redis -n devopstrack   --set auth.enabled=false

helm install metrics-db bitnami/influxdb2 -n devopstrack   --set adminUser.username=admin,adminUser.password=admin123,adminUser.token=dev-token,adminUser.organization=devopstrack,adminUser.bucket=metrics
```

### 4) Déployer les applications

```bash
kubectl apply -f deploy/k8s/base/apps/k8s-devopstrack-apps.yaml

kubectl -n devopstrack port-forward svc/projects-service 8001:8001
```

**Vérification**

```bash
kubectl -n devopstrack get deploy,svc,pods,hpa
kubectl -n devopstrack get pods -l "app.kubernetes.io/name in (auth-service,projects-service,tasks-service,metrics-service)"
```

---

## 🔄 Pipeline **CI/CD**

- **Qualité** : SonarCloud (trigger depuis GitHub Actions)
- **Build & Push GHCR** :  
  - `ghcr.io/<owner-lc>/<service>:<sha>`  
  - `ghcr.io/<owner-lc>/<service>:latest`
- **CD** : Terraform (infra) + Ansible (apps, monitoring)

Secrets requis : `SONAR_TOKEN`, `GITHUB_TOKEN`.

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
```

---

## 🧪 Tests rapides

```bash
kubectl get nodes
kubectl -n devopstrack get pods
kubectl -n devopstrack port-forward svc/projects-service 8001:8001
curl http://127.0.0.1:8001/docs
```

---

## ❗ Notes & bonnes pratiques

- Utiliser des bases **managées** en prod (RDS, Atlas…)
- Gérer les secrets via **SealedSecrets** ou **ExternalSecrets**
- Ajouter des probes HTTP `/healthz` si disponible
- Activer HPA (ou KEDA pour Redis worker)

---
