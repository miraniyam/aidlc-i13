# Compute Module - EC2 Instance
# Creates EC2 instance for hosting Backend API and Frontend applications

# Get latest Amazon Linux 2 AMI
data "aws_ami" "amazon_linux_2" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# EC2 Instance
resource "aws_instance" "app_server" {
  ami                    = data.aws_ami.amazon_linux_2.id
  instance_type          = var.instance_type
  key_name               = var.key_name
  subnet_id              = var.subnet_id
  vpc_security_group_ids = [var.security_group_id]
  iam_instance_profile   = var.iam_instance_profile

  root_block_device {
    volume_type           = "gp3"
    volume_size           = 30
    delete_on_termination = true
    encrypted             = true

    tags = merge(
      var.tags,
      {
        Name = "${var.project_name}-root-volume"
      }
    )
  }

  user_data = file("${path.module}/user_data.sh")

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-app-server"
    }
  )

  lifecycle {
    ignore_changes = [ami]
  }
}

# Elastic IP for EC2 (optional but recommended for stable public IP)
resource "aws_eip" "app_server" {
  instance = aws_instance.app_server.id
  domain   = "vpc"

  tags = merge(
    var.tags,
    {
      Name = "${var.project_name}-eip"
    }
  )

  depends_on = [aws_instance.app_server]
}
