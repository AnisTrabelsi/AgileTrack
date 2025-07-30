terraform {
  backend "s3" {
    bucket         = "devopstrack-tfstate-245040174852"
    key            = "global/infra.tfstate"
    region         = "eu-west-3"
    dynamodb_table = "devopstrack-tf-lock"
    encrypt        = true
  }
}
