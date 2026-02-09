#!/bin/bash
# EC2 User Data Script - Initialize EC2 instance for Table Order application

set -e

# Update system packages
yum update -y

# Install Python 3.11
amazon-linux-extras install python3.11 -y
ln -sf /usr/bin/python3.11 /usr/bin/python3
ln -sf /usr/bin/pip3.11 /usr/bin/pip3

# Install Nginx
amazon-linux-extras install nginx1 -y

# Install PostgreSQL client
amazon-linux-extras install postgresql14 -y

# Install Redis client
yum install redis -y

# Install Git
yum install git -y

# Install CloudWatch Agent
wget https://s3.amazonaws.com/amazoncloudwatch-agent/amazon_linux/amd64/latest/amazon-cloudwatch-agent.rpm
rpm -U ./amazon-cloudwatch-agent.rpm
rm -f ./amazon-cloudwatch-agent.rpm

# Create application directory
mkdir -p /opt/table-order/{backend,frontend,logs}
chown -R ec2-user:ec2-user /opt/table-order

# Create systemd service for FastAPI (placeholder)
cat > /etc/systemd/system/table-order-backend.service <<'EOF'
[Unit]
Description=Table Order Backend API
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/opt/table-order/backend
ExecStart=/usr/bin/python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=10
Environment="PATH=/usr/local/bin:/usr/bin:/bin"

[Install]
WantedBy=multi-user.target
EOF

# Configure Nginx (placeholder)
cat > /etc/nginx/conf.d/table-order.conf <<'EOF'
server {
    listen 80;
    server_name _;

    # Frontend - Customer UI
    location / {
        root /opt/table-order/frontend/customer-ui/build;
        try_files $uri $uri/ /index.html;
    }

    # Frontend - Admin UI
    location /admin {
        alias /opt/table-order/frontend/admin-ui/build;
        try_files $uri $uri/ /admin/index.html;
    }

    # Frontend - SuperAdmin UI
    location /superadmin {
        alias /opt/table-order/frontend/superadmin-ui/build;
        try_files $uri $uri/ /superadmin/index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # SSE support
        proxy_buffering off;
        proxy_cache off;
        proxy_set_header Connection '';
        proxy_http_version 1.1;
        chunked_transfer_encoding off;
    }
}
EOF

# Enable and start Nginx
systemctl enable nginx
systemctl start nginx

# Configure CloudWatch Agent (placeholder)
cat > /opt/aws/amazon-cloudwatch-agent/etc/config.json <<'EOF'
{
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/opt/table-order/logs/fastapi.log",
            "log_group_name": "/aws/ec2/table-order/fastapi",
            "log_stream_name": "{instance_id}/fastapi.log"
          },
          {
            "file_path": "/var/log/nginx/access.log",
            "log_group_name": "/aws/ec2/table-order/nginx",
            "log_stream_name": "{instance_id}/nginx-access.log"
          },
          {
            "file_path": "/var/log/nginx/error.log",
            "log_group_name": "/aws/ec2/table-order/nginx",
            "log_stream_name": "{instance_id}/nginx-error.log"
          }
        ]
      }
    }
  }
}
EOF

# Start CloudWatch Agent
/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
    -a fetch-config \
    -m ec2 \
    -s \
    -c file:/opt/aws/amazon-cloudwatch-agent/etc/config.json

# Create deployment instructions file
cat > /home/ec2-user/DEPLOYMENT_INSTRUCTIONS.txt <<'EOF'
Table Order Application Deployment Instructions
================================================

1. Backend Deployment:
   - Clone backend repository to /opt/table-order/backend
   - Install Python dependencies: pip3 install -r requirements.txt
   - Configure .env file with RDS and Redis endpoints
   - Run database migrations: alembic upgrade head
   - Start backend service: sudo systemctl start table-order-backend

2. Frontend Deployment:
   - Build React applications locally
   - Copy build files to:
     * /opt/table-order/frontend/customer-ui/build
     * /opt/table-order/frontend/admin-ui/build
     * /opt/table-order/frontend/superadmin-ui/build
   - Restart Nginx: sudo systemctl restart nginx

3. Verify Deployment:
   - Backend API: curl http://localhost:8000/api/health
   - Frontend: curl http://localhost/
   - Nginx status: sudo systemctl status nginx
   - Backend status: sudo systemctl status table-order-backend

4. View Logs:
   - FastAPI logs: tail -f /opt/table-order/logs/fastapi.log
   - Nginx access: tail -f /var/log/nginx/access.log
   - Nginx error: tail -f /var/log/nginx/error.log
   - CloudWatch Logs: Check AWS Console

5. Database Connection:
   - RDS endpoint: Check Terraform outputs
   - Connect: psql -h <rds-endpoint> -U admin -d tableorder

6. Redis Connection:
   - Redis endpoint: Check Terraform outputs
   - Connect: redis-cli -h <redis-endpoint>

For more details, see /opt/table-order/README.md
EOF

chown ec2-user:ec2-user /home/ec2-user/DEPLOYMENT_INSTRUCTIONS.txt

echo "EC2 initialization complete!"
