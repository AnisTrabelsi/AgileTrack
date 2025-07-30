variable "aws_region" {
  type    = string
  default = "eu-west-3"
}

variable "cluster_name" {
  type    = string
  default = "devopstrack-eks"
}

variable "vpc_cidr_block" {
  type    = string
  default = "10.0.0.0/16"
}

variable "desired_capacity" {
  type    = number
  default = 2
}

variable "node_instance_types" {
  type    = list(string)
  default = ["t3.small"] # instance compatible EKS
}
