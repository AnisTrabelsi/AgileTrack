Voici le **README.md** prêt à copier‑coller (entièrement en Markdown) 👇

````markdown
# DevOpsTrack

DevOpsTrack est une **plateforme micro‑services** pour suivre des pipelines CI/CD, gérer des projets et agréger des métriques d’exécution en temps réel.

---

## 📌 Sommaire
- [Fonctionnalités](#-fonctionnalités)
- [Pile technologique](#️-pile-technologique)
- [Démarrage local (Docker Compose)](#-démarrage-local-docker-compose)
- [Déploiement Kubernetes (k3d)](#️-déploiement-kubernetes-k3d)
- [Pipeline CI/CD](#-pipeline-cicd)
- [Arborescence du dépôt](#-arborescence-du-dépôt)
- [Tests rapides](#-tests-rapides)
- [Notes & bonnes pratiques](#-notes--bonnes-pratiques)

---

## 🚩 Fonctionnalités

- **Authentification JWT** : connexion sécurisée, rafraîchissement de jetons  
- **Gestion des utilisateurs** : rôles & droits (PostgreSQL)  
- **Module Projets** : CRUD dépôts / environnements / versions (FastAPI + MongoDB)  
- **Module Tâches** : file Redis (jobs CI/CD) + worker en temps réel  
- **Métriques & Logs** : endpoint `/metrics` (Prometheus), stockage InfluxDB  
- **Tableau de bord** : React 18 (Vite) + Tailwind (graphique builds, état jobs)  
- **Registry d’images** : **GHCR** (par défaut). *Nexus 3 reste optionnel en local.*  
- **Surveillance** : Prometheus scrappe les services, Grafana propose des dashboards  
- **CI/CD** : GitHub Actions → build → push GHCR → déploiement (Terraform + Ansible/K8s)

---

## ⚙️ Pile technologique

| Couche           | Outils principaux                                                                 |
|------------------|-----------------------------------------------------------------------------------|
| Frontend         | React 18 · Vite · TailwindCSS                                                     |
| Services         | Django (Auth) · FastAPI (Projects) · Node.js (Tasks) · Go (Metrics)               |
| Bases de données | PostgreSQL · MongoDB · Redis · InfluxDB                                           |
| Conteneurs       | Docker · Docker Compose                                                           |
| Orchestration    | Kubernetes (k3d en local, EKS en prod)                                            |
| Registry         | **GHCR** · *(Nexus 3 optionnel en local)*                                         |
| CI/CD            | Git & GitHub Actions (SonarCloud + Build & Push)                                  |
| IaC              | Terraform · Ansible                                                               |
| Monitoring       | Prometheus · Grafana                                                              |

---

## 🚀 Démarrage local (Docker Compose)

```bash
# Cloner le dépôt
git clone https://github.com/<owner>/<repo>.git
cd <repo>

# Lancer la stack locale (Prometheus, Grafana, DBs, etc.)
docker compose -f deploy/compose.yml up --build -d

# Accès rapides :
# - Auth API       : http://localhost:8000
# - Projects API   : http://localhost:8001
# - Tasks API      : http://localhost:8002
# - Prometheus     : http://localhost:9090
# - Grafana        : http://localhost:3000 (admin / admin)
# - (Option) Nexus : http://localhost:8081
````

Arrêt & nettoyage :

```bash
docker compose -f deploy/compose.yml down -v
```

---

## ☸️ Déploiement Kubernetes (k3d)

### 1) Créer un cluster k3d

```bash
k3d cluster create devopstrack --servers 1 --agents 2 -p "80:80@loadbalancer"
kubectl config use-context k3d-devopstrack
kubectl get nodes
```

### 2) Namespace + pull secret GHCR

> Créer un **PAT GitHub** avec scope **`read:packages`** (pull d’images depuis GHCR).

```bash
# Namespace
kubectl apply -f deploy/k8s/base/namespaces.yaml   # crée 'devopstrack'

# Pull secret GHCR (remplacez les <>)
kubectl -n devopstrack create secret docker-registry image-pull-ghcr \
  --docker-server=ghcr.io \
  --docker-username=<github-username> \
  --docker-password=<PAT read:packages> \
  --docker-email=<email>

# (Facultatif) lier au ServiceAccount par défaut
kubectl -n devopstrack patch serviceaccount default --type merge \
  -p '{"imagePullSecrets":[{"name":"image-pull-ghcr"}]}'
```

### 3) Bases (Helm – charts Bitnami)

```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update

# PostgreSQL (Auth)
helm install auth-db bitnami/postgresql -n devopstrack \
  --set auth.username=postgres,auth.password=postgres,auth.database=auth

# MongoDB (Projects - POC sans auth)
helm install projects-db bitnami/mongodb -n devopstrack \
  --set auth.enabled=false

# Redis (Tasks - POC sans auth)
helm install tasks-redis bitnami/redis -n devopstrack \
  --set auth.enabled=false

# InfluxDB v2 (Metrics)
helm install metrics-db bitnami/influxdb2 -n devopstrack \
  --set adminUser.username=admin,adminUser.password=admin123,adminUser.token=dev-token,adminUser.organization=devopstrack,adminUser.bucket=metrics
```

### 4) Déployer les apps

```bash
kubectl apply -f deploy/k8s/base/apps/k8s-devopstrack-apps.yaml
kubectl -n devopstrack get deploy,svc,pods,hpa
```

> Test rapide :

```bash
kubectl -n devopstrack port-forward svc/projects-service 8001:8001
# puis ouvrir http://127.0.0.1:8001/docs
```

---

## 🔄 Pipeline CI/CD

* **CI (qualité)** : SonarCloud (désactiver *Automatic Analysis* côté SonarCloud, on lance via GitHub Actions).
* **Build & Push** : chaque image est poussée vers **GHCR** avec les tags :

  * `ghcr.io/<owner-lc>/<service>:<sha>`
  * `ghcr.io/<owner-lc>/<service>:latest`
* **CD** : Terraform (cluster & réseau) puis Ansible (bootstrap K8s, monitoring, déploiement apps/secrets).

> Secrets requis dans GitHub Actions : `SONAR_TOKEN`.
> `GITHUB_TOKEN` permet l’auth GHCR (publication). **Les noms d’images doivent être en minuscules** (exigence GHCR).

---

## 📂 Arborescence du dépôt

```
frontend/                 # React SPA
auth-service/             # Django + JWT
projects-service/         # FastAPI CRUD
tasks-service/            # Node.js API + worker Redis
metrics-service/          # Go + /metrics Prometheus + Influx writer
deploy/
  compose.yml             # Stack locale (DB + Prom + Grafana + option Nexus)
  k8s/
    base/
      namespaces.yaml
      apps/
        k8s-devopstrack-apps.yaml
infra/
  terraform/              # (POC k3d / prod EKS)
  ansible/                # bootstrap (ingress, monitoring), app (manifests)
.github/workflows/
  ci.yml                  # SonarCloud + build & push GHCR
```

---

## 🧪 Tests rapides

```bash
# Health cluster & workloads
kubectl get nodes
kubectl -n devopstrack get pods

# Port-forward Projects pour tester
kubectl -n devopstrack port-forward svc/projects-service 8001:8001
curl http://127.0.0.1:8001/docs
```

---

## ❗ Notes & bonnes pratiques

* En **prod**, préférer des **bases managées** (RDS Postgres, Mongo Atlas/DocDB, ElastiCache…).
* Gérer les secrets via **SealedSecrets** ou **External Secrets** (plutôt que des `Secret` en clair).
* Ajouter des **probes HTTP** si les services exposent `/healthz` (probes TCP utilisées par défaut).
* Activer **HPA** (CPU/Memory) et éventuellement **KEDA** pour scaler le worker sur Redis.

---

```

Si tu veux, je peux aussi t’ajouter une section **Badges** (CI, Quality gate, images GHCR) avec les URLs adaptées à ton repo.
```
