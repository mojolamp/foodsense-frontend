# AWS 部署指南 - FoodSense Frontend

## 概述

本指南說明如何將 FoodSense Frontend 部署到 AWS。支援兩種部署方式：
1. **AWS App Runner** (推薦，簡單快速)
2. **AWS ECS** (更多控制選項)

---

## 快速開始 (AWS App Runner)

### 1. 前置需求

```bash
# 安裝 AWS CLI
brew install awscli

# 設定 AWS credentials
aws configure
```

### 2. 建立 ECR Repository

```bash
aws ecr create-repository \
  --repository-name foodsense-frontend \
  --region ap-northeast-1
```

### 3. 建立 App Runner Service

```bash
# 登入 ECR
aws ecr get-login-password --region ap-northeast-1 | docker login --username AWS --password-stdin <AWS_ACCOUNT_ID>.dkr.ecr.ap-northeast-1.amazonaws.com

# 建立並推送 Docker image
cd foodsense-frontend
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL="your_supabase_url" \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="your_anon_key" \
  --build-arg NEXT_PUBLIC_API_URL="your_api_url" \
  -t foodsense-frontend .

docker tag foodsense-frontend:latest <AWS_ACCOUNT_ID>.dkr.ecr.ap-northeast-1.amazonaws.com/foodsense-frontend:latest
docker push <AWS_ACCOUNT_ID>.dkr.ecr.ap-northeast-1.amazonaws.com/foodsense-frontend:latest
```

### 4. 透過 AWS Console 建立 App Runner Service

1. 前往 AWS App Runner Console
2. 點擊 "Create service"
3. 選擇 "Container registry" → "Amazon ECR"
4. 選擇剛才推送的 image
5. 設定：
   - Port: 3000
   - CPU: 1 vCPU
   - Memory: 2 GB
6. 建立並等待部署完成

---

## GitHub Actions 自動部署

### 設定 GitHub Secrets

在 GitHub repository settings 中新增以下 secrets：

| Secret Name | 說明 |
|-------------|------|
| `AWS_ROLE_ARN` | AWS IAM Role ARN (用於 OIDC) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Key |
| `NEXT_PUBLIC_API_URL` | Backend API URL |
| `NEXT_PUBLIC_API_V1_BASE` | API V1 Base URL |
| `NEXT_PUBLIC_API_V2_BASE` | API V2 Base URL |
| `NEXT_PUBLIC_LAWCORE_BASE` | LawCore API Base URL |
| `APP_RUNNER_SERVICE_ARN` | App Runner Service ARN |

### 設定 AWS IAM OIDC

1. 在 AWS IAM 建立 Identity Provider：
   - Provider type: OpenID Connect
   - Provider URL: `https://token.actions.githubusercontent.com`
   - Audience: `sts.amazonaws.com`

2. 建立 IAM Role：

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::<ACCOUNT_ID>:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:<GITHUB_ORG>/<REPO_NAME>:*"
        }
      }
    }
  ]
}
```

3. 附加必要權限：

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "ecr:PutImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "apprunner:UpdateService",
        "apprunner:DescribeService"
      ],
      "Resource": "arn:aws:apprunner:ap-northeast-1:<ACCOUNT_ID>:service/foodsense-frontend/*"
    }
  ]
}
```

---

## ECS 部署 (進階)

### Terraform 設定

如果你偏好使用 ECS，可以使用以下 Terraform 配置：

```hcl
# main.tf
resource "aws_ecs_cluster" "foodsense" {
  name = "foodsense-cluster"
}

resource "aws_ecs_task_definition" "frontend" {
  family                   = "foodsense-frontend-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "512"
  memory                   = "1024"
  execution_role_arn       = aws_iam_role.ecs_execution.arn

  container_definitions = jsonencode([
    {
      name  = "foodsense-frontend"
      image = "${aws_ecr_repository.frontend.repository_url}:latest"
      portMappings = [
        {
          containerPort = 3000
          hostPort      = 3000
          protocol      = "tcp"
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/foodsense-frontend"
          "awslogs-region"        = "ap-northeast-1"
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])
}

resource "aws_ecs_service" "frontend" {
  name            = "foodsense-frontend-service"
  cluster         = aws_ecs_cluster.foodsense.id
  task_definition = aws_ecs_task_definition.frontend.arn
  desired_count   = 2
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.private_subnet_ids
    security_groups  = [aws_security_group.frontend.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.frontend.arn
    container_name   = "foodsense-frontend"
    container_port   = 3000
  }
}
```

---

## 環境變數

### 必須設定

| 變數名稱 | 說明 | 範例 |
|---------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 專案 URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名金鑰 | `eyJhbG...` |
| `NEXT_PUBLIC_API_URL` | 後端 API 基礎 URL | `https://api.foodsense.com` |

### 選擇性設定

| 變數名稱 | 預設值 | 說明 |
|---------|--------|------|
| `NEXT_PUBLIC_FEATURE_LAWCORE_ENABLED` | `true` | 啟用 LawCore 功能 |
| `NEXT_PUBLIC_FEATURE_REVIEW_QUEUE_SHORTCUTS` | `false` | 啟用審核快捷鍵 |

---

## 監控與日誌

### CloudWatch Logs

部署後，可以在 CloudWatch Logs 查看應用程式日誌：

```bash
aws logs tail /ecs/foodsense-frontend --follow
```

### Health Check

App Runner 會自動監控 `/` 端點的 health status。

---

## 故障排除

### 常見問題

#### 1. Docker build 失敗

```bash
# 確認 node_modules 不在 context 中
cat .dockerignore | grep node_modules

# 清除快取重新建置
docker build --no-cache -t foodsense-frontend .
```

#### 2. 環境變數未正確載入

```bash
# 檢查建置時環境變數
docker run --rm foodsense-frontend env | grep NEXT_PUBLIC
```

#### 3. App Runner 部署逾時

- 確認 Health check 端點回應正常
- 檢查 CloudWatch Logs 是否有錯誤
- 確認 ECR image 可以正常拉取

---

## 成本估算

### App Runner (推薦)

| 項目 | 規格 | 月費 (USD) |
|------|------|-----------|
| CPU | 1 vCPU | ~$15 |
| Memory | 2 GB | ~$10 |
| Requests | 1M requests | ~$1 |
| **總計** | | **~$26/月** |

### ECS Fargate

| 項目 | 規格 | 月費 (USD) |
|------|------|-----------|
| Task (2 instances) | 0.5 vCPU, 1GB | ~$30 |
| ALB | - | ~$20 |
| CloudWatch | - | ~$5 |
| **總計** | | **~$55/月** |

---

## 下一步

1. 設定 GitHub Secrets
2. 建立 AWS 資源 (ECR, App Runner)
3. 觸發第一次部署
4. 設定自定義域名 (可選)
5. 設定 CloudWatch Alarms (可選)
