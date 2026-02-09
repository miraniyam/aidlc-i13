# Terraform State Backend Configuration
# Currently using local backend for simplicity

# For team collaboration, consider using S3 backend:
# terraform {
#   backend "s3" {
#     bucket         = "your-terraform-state-bucket"
#     key            = "table-order/prod/terraform.tfstate"
#     region         = "ap-northeast-2"
#     encrypt        = true
#     dynamodb_table = "terraform-state-lock"
#   }
# }

# Local backend (default)
# State file will be stored in this directory as terraform.tfstate
