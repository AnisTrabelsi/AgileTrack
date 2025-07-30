# =====================================================================
# Création du cluster EKS avec le module officiel Terraform
# (terraform-aws-modules/eks/aws)
# =====================================================================

module "eks" {
  source  = "terraform-aws-modules/eks/aws"   # Module officiel EKS depuis le registry Terraform
  version = "~> 20.0"                         # Version du module (20.x)

  # Nom et version du cluster
  cluster_name    = var.cluster_name          # Ex : "devopstrack-eks"
  cluster_version = "1.30"                    # Version Kubernetes du cluster

  # Intégration réseau
  vpc_id     = module.vpc.vpc_id              # ID du VPC créé via le module VPC
  subnet_ids = module.vpc.private_subnets     # Utilisation des sous-réseaux privés pour les nœuds

  # Définition d’un groupe de nœuds managés par EKS
  eks_managed_node_groups = {
    default = {
      desired_size   = var.desired_capacity   # Taille initiale du groupe (ex: 2 nœuds)
      max_size       = 4                      # Nombre maximum de nœuds (auto-scaling possible)
      min_size       = 2                      # Nombre minimum de nœuds
      instance_types = var.node_instance_types # Types d’instances EC2 utilisées (ex: t3.medium)
    }
  }

  # Tags appliqués à toutes les ressources créées
  tags = {
    Project = "devopstrack"
  }
}

# =====================================================================
# Datasources : récupération des infos du cluster pour le provider Kubernetes
# =====================================================================

# Récupère les infos principales du cluster EKS (endpoint, CA, etc.)
data "aws_eks_cluster" "main" {
  name = module.eks.cluster_name
}

# Récupère le token d’authentification pour accéder au cluster
data "aws_eks_cluster_auth" "main" {
  name = module.eks.cluster_name
}
