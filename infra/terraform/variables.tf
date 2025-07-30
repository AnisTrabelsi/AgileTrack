# =====================================================================
# Variables utilisées pour paramétrer l’infrastructure EKS
# Ces variables permettent de personnaliser le cluster et son réseau
# sans modifier directement les fichiers de ressources.
# =====================================================================

# Nom du cluster EKS
variable "cluster_name" {
  type    = string                     # Type attendu : une chaîne de caractères
  default = "devopstrack-eks"          # Valeur par défaut du nom du cluster
}

# CIDR du VPC (plage d’adresses IP du réseau principal AWS)
variable "vpc_cidr_block" {
  type    = string
  default = "10.0.0.0/16"              # Ici, un grand réseau (65 536 adresses IP possibles)
}

# Types d’instances EC2 utilisées pour les nœuds du cluster
variable "node_instance_types" {
  type    = list(string)                # Type attendu : une liste de chaînes de caractères
  default = ["t3.medium"]               # Par défaut, des instances t3.medium (2 vCPU, 4 Go RAM)
}

# Nombre souhaité de nœuds dans le cluster (scaling initial)
variable "desired_capacity" {
  type    = number                      # Type attendu : un nombre
  default = 2                           # Cluster commencera avec 2 nœuds
}
