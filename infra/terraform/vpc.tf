# =====================================================================
# Création du VPC et de ses sous-réseaux via le module officiel AWS VPC
# (terraform-aws-modules/vpc/aws)
# =====================================================================

module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"   # Module VPC réutilisable depuis le registry Terraform
  version = "~> 5.0"                          # Version du module (5.x)

  # Nom du VPC (reprend le nom du cluster EKS)
  name = var.cluster_name

  # CIDR principal du VPC (plage IP du réseau)
  cidr = var.vpc_cidr_block

  # Sélection des 3 premières zones de disponibilité disponibles
  azs = slice(data.aws_availability_zones.available.names, 0, 3)

  # Définition des sous-réseaux privés (pour les nœuds EKS)
  # On découpe le CIDR en /20 à partir du bloc principal (10.0.0.0/16 → 16 sous-réseaux)
  private_subnets = [for i in range(3) : cidrsubnet(var.vpc_cidr_block, 4, i)]

  # Définition des sous-réseaux publics (pour le Load Balancer, NAT Gateway, etc.)
  public_subnets = [for i in range(3) : cidrsubnet(var.vpc_cidr_block, 4, i + 3)]

  # NAT Gateway activée pour permettre aux instances privées d'accéder à Internet
  enable_nat_gateway = true
  single_nat_gateway = true  # Une seule NAT Gateway partagée (réduit les coûts)

  # Tags appliqués aux ressources créées par ce module
  tags = {
    Project = "devopstrack"
  }
}

# =====================================================================
# Data source AWS : récupération des zones de disponibilité disponibles
# =====================================================================
data "aws_availability_zones" "available" {}
