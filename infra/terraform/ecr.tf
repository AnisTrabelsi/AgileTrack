# =====================================================================
# Création des dépôts ECR (Elastic Container Registry)
# pour stocker les images Docker des microservices du projet DevOpsTrack
# =====================================================================

module "ecr" {
  source  = "terraform-aws-modules/ecr/aws"   # Module officiel ECR depuis le registry Terraform
  version = "~> 1.0"                          # Version du module (1.x)

  # Liste des dépôts ECR à créer
  repositories = [
    "frontend",           # Dépôt pour l’image Docker du frontend React/Angular
    "projects-service",   # Dépôt pour le microservice Projects (ex: FastAPI + MongoDB)
    "tasks-service",      # Dépôt pour le microservice Tasks (ex: Node.js + Redis)
    "tasks-worker",       # Dépôt pour le worker (consommation de jobs asynchrones)
    "metrics-service"     # Dépôt pour le service Metrics (ex: Go + InfluxDB)
  ]

  # Optionnel : définir les rôles/ARNs AWS qui auront accès en lecture/écriture
  repository_read_write_access_arns = []  # Exemple : ["arn:aws:iam::<ACCOUNT-ID>:role/ci-cd-role"]
}
