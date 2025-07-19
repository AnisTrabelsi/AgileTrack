# DevOpsTrack

DevOpsTrack est une **plateforme micro‑services** destinée au suivi complet des pipelines CI / CD, à la gestion des projets techniques et à l’agrégation de métriques d’exécution en temps réel.

---

## 🚩  Fonctionnalités clés

* **Authentification JWT** : connexion sécurisée, rafraîchissement de jetons.
* **Gestion des utilisateurs** : rôles et droits stockés dans PostgreSQL.
* **Module Projets** : CRUD des dépôts, environnements, versions (FastAPI + MongoDB).
* **Module Tâches** : file d’attente Redis simulant des jobs CI/CD, état en temps réel.
* **Métriques & Logs** : exposition `/metrics` Prometheus + stockage InfluxDB.
* **Tableau de bord Web** : React 18 (Vite) & Tailwind, graphique des builds, état des jobs.
* **Registry privé** : Nexus 3 hébergeant les images Docker de chaque service.
* **Surveillance** : Prometheus scrape tous les services, Grafana fournit des dashboards prêts à l’emploi.
* **Pipeline CI/CD** : GitHub Actions → build → push dans Nexus → déploiement automatisé via Terraform + Ansible.

---

## ⚙️  Pile technologique

| Couche           | Outils principaux                                                                 |
| ---------------- | --------------------------------------------------------------------------------- |
| Frontend         | React 18 · Vite · TailwindCSS                                                     |
| Services         | Django (Authentification) · FastAPI (Projets) · Node.js (Tâches) · Go (Métriques) |
| Bases de données | PostgreSQL · MongoDB · Redis · InfluxDB                                           |
| Conteneurs       | Docker · Docker Compose                                                           |
| Orchestration    | Kubernetes (k3d ou EKS)                                                           |
| Registry         | Nexus 3                                                                           |
| CI/CD            | Git & GitHub Actions                                                              |
| IaC              | Terraform · Ansible                                                               |
| Monitoring       | Prometheus · Grafana                                                              |

---

## 🚀  Lancer localement

```bash
# Cloner le dépôt
git clone https://github.com/anis477/devopstrack.git && cd devopstrack

# Lancer tous les services (y compris Nexus)
docker compose -f deploy/compose.yml up --build -d

# Accès :
• Interface : http://localhost
• Nexus    : http://localhost:8081 (mot de passe initial dans les logs)
• Grafana  : http://localhost:3000 (admin / admin)
```

Arrêt : `docker compose down -v`.

---

## ☸️  Déploiement Kubernetes

```bash
# Cluster local\ nk3d cluster create devopstrack --agents 1
kubectl apply -k deploy/k8s
kubectl port-forward svc/gateway 8080:80 &  # UI sur http://localhost:8080
```

Suppression : `k3d cluster delete devopstrack`.

---

## ☁️  Déploiement AWS (optionnel)

```bash
# Provision VPC + EC2 avec Terraform
cd infra/terraform
terraform init && terraform apply -auto-approve

# Installation Docker + stack via Ansible
cd ../ansible
ansible-playbook -i inventory.yaml site.yml
```

Les IP publiques `nexus_ip` et `app_ip` s’affichent en sortie.

---

## 🔄  Pipeline CI/CD

1. **CI** : tests unitaires React (`npm test`), Django (`pytest`), Go (`go test`).
2. **Build & Push** : GitHub Actions construit chaque image et la pousse dans Nexus 3.
3. **Déploiement** : le même workflow exécute `terraform apply` puis `ansible-playbook` pour mettre à jour l’EC2 ou le cluster EKS.

---

## 📂  Arborescence du dépôt

```
frontend/            React SPA
auth-service/        Django + JWT\ nprojects-service/    FastAPI CRUD
tasks-service/       Node.js + Redis
metrics-service/     Go + Prometheus
deploy/              Compose & manifests K8s
infra/terraform/     Scripts Terraform
infra/ansible/       Playbooks Ansible
```

