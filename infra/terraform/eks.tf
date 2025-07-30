##############################################################################
# EKS 1.30 – module v20 (provider AWS v5)  cluster EKS 1.30 + node group Spot
##############################################################################

data "aws_caller_identity" "current" {}

module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.0"

  cluster_name    = var.cluster_name
  cluster_version = "1.30"

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  # API endpoint public + privé
  cluster_endpoint_private_access      = true
  cluster_endpoint_public_access       = true
  cluster_endpoint_public_access_cidrs = ["0.0.0.0/0"]

  # Node group Spot t3.small
  eks_managed_node_groups = {
    default = {
      desired_size   = var.desired_capacity
      max_size       = 2
      min_size       = 1
      instance_types = var.node_instance_types
      capacity_type  = "SPOT"
    }
  }

  # Accès kubectl : entry admin via la nouvelle API access‑entries
  access_entries = {
    admin = {
      principal_arn = data.aws_caller_identity.current.arn
      policy_associations = {
        admin = {
          policy_arn = "arn:aws:eks::aws:cluster-access-policy/AmazonEKSClusterAdminPolicy"
          access_scope = { type = "cluster" }
        }
      }
    }
  }

  tags = { Project = "devopstrack" }
}
