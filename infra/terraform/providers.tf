# =====================================================================
# Ce fichier définit les providers utilisés dans Terraform.
# - Le provider AWS : permet de créer et gérer des ressources AWS.
# - Le provider Kubernetes : permet d’interagir avec un cluster EKS
#   une fois celui-ci déployé sur AWS.
# =====================================================================

# Déclaration d'une variable pour définir la région AWS
variable "aws_region" {
  type    = string                     # Type attendu : une chaîne de caractères
  default = "eu-west-3"                # Valeur par défaut : région Paris (AWS Europe Ouest 3)
}

# Configuration du provider AWS
provider "aws" {
  region = var.aws_region              # On utilise la variable "aws_region" pour définir la région
}

# Provider Kubernetes (sera utilisable une fois le cluster EKS créé)
provider "kubernetes" {
  host                   = aws_eks_cluster.main.endpoint                          # URL de l’API Kubernetes du cluster EKS
  cluster_ca_certificate = base64decode(aws_eks_cluster.main.certificate_authority[0].data) # Certificat CA du cluster (décodé en base64)
  token                  = data.aws_eks_cluster_auth.main.token                   # Jeton d’authentification généré via AWS
}
