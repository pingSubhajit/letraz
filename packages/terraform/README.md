# Letraz Terraform Infrastructure

This Terraform configuration manages the complete Letraz infrastructure on DigitalOcean, including both server and utilities components.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Architecture

The infrastructure is organized into two main modules:

### Server Module (`modules/server/`)
- **Purpose**: API server infrastructure
- **Resources**: 
  - DigitalOcean droplet for API server
  - Firewall rules (SSH, HTTP, HTTPS)
  - DNS records for API endpoints
- **Services**: 
  - `api.letraz.app` - Main API endpoint
  - `api-grpc.letraz.app` - gRPC API endpoint

### Utils Module (`modules/utils/`)
- **Purpose**: Utilities and support services
- **Resources**:
  - DigitalOcean droplet for utilities
  - Spaces bucket with optional CDN
  - Firewall rules (SSH, HTTP, HTTPS)
  - DNS record for utils endpoint
- **Services**:
  - `utils.letraz.app` - Utilities service
  - Object storage and CDN

## Usage

### Prerequisites
- DigitalOcean API token
- SSH keys for server access
- Terraform >= 1.5.0

### Deploy Infrastructure

1. **Initialize Terraform:**
   ```bash
   terraform init
   ```

2. **Review the plan:**
   ```bash
   terraform plan
   ```

3. **Apply the configuration:**
   ```bash
   terraform apply
   ```

### Configuration

Copy `terraform.tfvars.example` to `terraform.tfvars` and update with your values:

```bash
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your actual values
```

Key variables include:

- `do_token` - DigitalOcean API token
- `ssh_key_public_keys` - SSH public keys for access
- `admin_email` - Email for SSL certificate registration
- `manage_dns` - Whether to create DNS records
- Environment-specific configurations for both modules

### Outputs

After deployment, you'll get:

- IP addresses for both droplets
- SSH connection commands
- Spaces bucket information
- CDN endpoint (if enabled)

### Module Structure

```
letraz-tf/
├── main.tf                      # Root configuration calling modules
├── variables.tf                 # Root variables
├── outputs.tf                  # Consolidated outputs
├── terraform.tfvars.example    # Configuration template
├── .gitignore                   # Git ignore file
├── modules/
│   ├── server/                 # Server module
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   └── templates/
│   │       └── userdata.sh.tftpl
│   └── utils/                  # Utils module
│       ├── main.tf
│       ├── variables.tf
│       ├── outputs.tf
│       └── templates/
│           └── userdata.sh.tftpl
└── README.md
```

## Maintenance

### Updating Configuration
1. Modify `terraform.tfvars` for configuration changes
2. Update module variables if needed
3. Run `terraform plan` to review changes
4. Apply with `terraform apply`

### Module Development
Each module is self-contained with its own:
- Variables for configuration
- Resources for infrastructure
- Outputs for integration
- Templates for cloud-init/userdata

This modular approach allows for independent development and reuse of components.
