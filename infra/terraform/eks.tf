##############################################################################
#  EKS 1.30  –  Module terraform‑aws‑modules/eks v20  (provider AWS ≥ 5)
#  ▸ Cluster endpoint public + private
#  ▸ Node Group Spot (t3.small par défaut)
#  ▸ Deux access‑entries :
#       • admin  → utilisateur IAM « anis »
#       • github → rôle OIDC utilisé par les workflows GitHub Actions
##############################################################################

##############################
# Infos sur le compte courant
##############################
data "aws_caller_identity" "current" {}

#############################################
# ARN statiques (pour éviter le drift CI/CD)
#############################################
locals {
  # Remplacez par votre utilisateur IAM « admin » si besoin
  admin_iam_user_arn = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:user/anis"

  # Rôle OIDC configuré pour GitHub Actions
  gha_role_arn = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/gha-eks-deploy"
}

#############################################
# Module EKS
#############################################
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.0"

  # ------------- Cluster -------------------
  cluster_name    = var.cluster_name # ex. devopstrack-eks
  cluster_version = "1.30"

  # ------------- Réseau --------------------
  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  cluster_endpoint_private_access      = true
  cluster_endpoint_public_access       = true
  cluster_endpoint_public_access_cidrs = ["0.0.0.0/0"] # ⚠ à restreindre en production

  # ------------- Node Group Spot ----------
  eks_managed_node_groups = {
    default = {
      min_size       = 1
      desired_size   = var.desired_capacity # = 2 par défaut → variables.tf
      max_size       = 2
      capacity_type  = "SPOT"
      instance_types = var.node_instance_types # ["t3.small"] par défaut
    }
  }

  # ------------- Accès kubectl ------------
  access_entries = {
    # 1) Utilisateur IAM (console/CLI) -------#
    admin = {
      principal_arn = local.admin_iam_user_arn

      policy_associations = {
        admin = {
          policy_arn   = "arn:aws:eks::aws:cluster-access-policy/AmazonEKSClusterAdminPolicy"
          access_scope = { type = "cluster" }
        }
      }
    }

    # 2) Rôle GitHub Actions (OIDC) ----------#
    github_actions = {
      principal_arn = local.gha_role_arn

      policy_associations = {
        admin = {
          policy_arn   = "arn:aws:eks::aws:cluster-access-policy/AmazonEKSClusterAdminPolicy"
          access_scope = { type = "cluster" }
        }
      }
    }
  }

  # ------------- Tags communs --------------
  tags = {
    Project = "devopstrack"
  }
}
