##############################################################################
# Dépôts ECR – module v1.7 (simple et robuste)
##############################################################################

locals {
  ecr_repos = [
    "frontend",
    "auth-service",
    "projects-service",
    "tasks-service",
    "tasks-worker",
    "metrics-service",
  ]
}

module "ecr" {
  source  = "terraform-aws-modules/ecr/aws"
  version = "~> 1.7"

  for_each                = toset(local.ecr_repos)
  repository_name         = each.value
  create_lifecycle_policy = false   # pas de policy pour éviter l'erreur 400

  tags = { Project = "devopstrack" }
}
