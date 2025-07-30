# =====================================================================
# Ce fichier configure le backend de Terraform.
# - Il définit où et comment l’état (terraform.tfstate) est stocké.
# - Ici, l’état est conservé dans un bucket S3, chiffré, et verrouillé
#   via une table DynamoDB pour éviter les modifications concurrentes.
# - Il impose également une version minimale de Terraform.
# =====================================================================

terraform {
  backend "s3" {
    bucket         = "devopstrack-tfstate-<ACCOUNT-ID>" # Nom du bucket S3 où sera stocké le fichier d'état Terraform (tfstate).
    key            = "global/infra.tfstate"             # Chemin/clé dans le bucket : ici, le fichier sera stocké sous "global/infra.tfstate".
    region         = "eu-west-3"                        # Région AWS du bucket S3 (ici Paris).
    dynamodb_table = "devopstrack-tf-lock"              # Table DynamoDB utilisée pour gérer le verrouillage (évite que 2 personnes modifient le state en même temps).
    encrypt        = true                               # Active le chiffrement côté serveur (SSE-S3) du fichier tfstate.
  }

  required_version = ">= 1.6.0"                         # Indique que Terraform doit être en version 1.6.0 ou supérieure pour exécuter ce projet.
}
