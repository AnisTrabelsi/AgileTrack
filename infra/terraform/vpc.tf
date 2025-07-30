data "aws_availability_zones" "available" {}

module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = var.cluster_name
  cidr = var.vpc_cidr_block
  azs  = slice(data.aws_availability_zones.available.names, 0, 3)

  private_subnets = [for i in range(3) : cidrsubnet(var.vpc_cidr_block, 4, i)]
  public_subnets  = [for i in range(3) : cidrsubnet(var.vpc_cidr_block, 4, i + 3)]

  enable_nat_gateway = true
  single_nat_gateway = true

  tags = { Project = "devopstrack" }
}
