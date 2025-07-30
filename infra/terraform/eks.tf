##############################################################################
#  EKS 1.30  –  terraform‑aws‑modules/eks v20 (provider AWS v5)
#  • Cluster public + private
#  • NodeGroup Spot (t3.small par défaut)
#  • Access‑entries : admin local + rôle GitHub Actions
##############################################################################



data "aws_caller_identity" "current" {}

# ---------------------------------------------------------------------------
#  Module EKS
# ---------------------------------------------------------------------------
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.0"

  # ---------- Cluster ----------
  cluster_name    = var.cluster_name # ex : "devopstrack-eks"
  cluster_version = "1.30"

  # ---------- Réseau ----------
  vpc_id     = module.vpc.vpc_id # module VPC défini dans vpc.tf
  subnet_ids = module.vpc.private_subnets

  cluster_endpoint_private_access      = true
  cluster_endpoint_public_access       = true
  cluster_endpoint_public_access_cidrs = ["0.0.0.0/0"]

  # ---------- Node group (Spot) ----------
  eks_managed_node_groups = {
    default = {
      min_size       = 1
      desired_size   = var.desired_capacity
      max_size       = 2
      capacity_type  = "SPOT"
      instance_types = var.node_instance_types # ex : ["t3.small"]
    }
  }

  # ---------- Accès kubectl ----------
  access_entries = {
    # Ton utilisateur IAM → admin du cluster
    admin = {
      principal_arn = data.aws_caller_identity.current.arn

      policy_associations = {
        admin = {
          policy_arn   = "arn:aws:eks::aws:cluster-access-policy/AmazonEKSClusterAdminPolicy"
          access_scope = { type = "cluster" }
        }
      }
    }

    # Rôle GitHub Actions pour les workflows
    github_actions = {
      principal_arn = "arn:aws:iam::245040174852:role/gha-eks-deploy"

      policy_associations = {
        admin = {
          policy_arn   = "arn:aws:eks::aws:cluster-access-policy/AmazonEKSClusterAdminPolicy"
          access_scope = { type = "cluster" }
        }
      }
    }
  }

  tags = {
    Project = "devopstrack"
  }
}

# ---------------------------------------------------------------------------
#  Variables (référencées ci‑dessus) — à laisser dans variables.tf
# ---------------------------------------------------------------------------
# variable "cluster_name"       { type = string }
# variable "desired_capacity"   { type = number default = 1 }
# variable "node_instance_types"{ type = list(string) default = ["t3.small"] }
