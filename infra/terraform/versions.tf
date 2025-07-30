terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source = "hashicorp/aws"
      # ➜  accepte toute 5.x (≥ 5.80) et bloque la future 6.x
      version = ">= 5.80.0, < 6.0.0"
    }
  }
}
