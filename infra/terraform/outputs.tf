# =====================================================================
# Outputs Terraform : informations utiles après le déploiement
# =====================================================================

# Affiche le nom du cluster EKS créé
output "cluster_name" {
  value = module.eks.cluster_name
}

# Affiche la région AWS utilisée
output "region" {
  value = var.aws_region
}

# Commande pratique pour configurer kubectl avec ton cluster
output "kubeconfig_cmd" {
  value = "aws eks update-kubeconfig --name ${module.eks.cluster_name} --region ${var.aws_region}"
}
