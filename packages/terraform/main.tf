terraform {
  required_version = ">= 1.5.0"
  required_providers {
    digitalocean = {
      source  = "digitalocean/digitalocean"
      version = ">= 2.34.1"
    }
    random = {
      source  = "hashicorp/random"
      version = ">= 3.6.0"
    }
  }
}

provider "digitalocean" {
  token             = var.do_token
  spaces_access_id  = var.spaces_access_key_id
  spaces_secret_key = var.spaces_access_key_secret
}

# Upload SSH keys once at root level to be shared by both modules
resource "digitalocean_ssh_key" "uploaded" {
  for_each   = { for idx, key in var.ssh_key_public_keys : tostring(idx) => key if length(var.ssh_key_public_keys) > 0 }
  name       = "letraz-shared-${each.key}"
  public_key = each.value
}

# Server module - API server droplet
module "server" {
  source = "./modules/server"

  # Common variables
  do_token              = var.do_token
  ssh_keys              = concat(var.ssh_keys, [for k in values(digitalocean_ssh_key.uploaded) : k.fingerprint])
  ssh_key_public_keys   = var.ssh_key_public_keys
  region                = var.region
  vpc_uuid              = var.vpc_uuid
  extra_tags            = var.extra_tags
  admin_email           = var.admin_email

  # Server-specific variables
  hostname              = var.server_hostname
  size                  = var.server_size
  image                 = var.server_image
  manage_dns            = var.manage_dns
  root_domain           = var.root_domain
  api_fqdn              = var.api_fqdn
  api_grpc_fqdn         = var.api_grpc_fqdn
  app_env_content       = var.server_app_env_content
  
  # GitHub configuration
  github_username       = var.github_username
  github_token          = var.github_token
}

# Utils module - Utilities droplet with Spaces
module "utils" {
  source = "./modules/utils"

  # Common variables
  do_token                    = var.do_token
  ssh_keys                    = concat(var.ssh_keys, [for k in values(digitalocean_ssh_key.uploaded) : k.fingerprint])
  ssh_key_public_keys         = var.ssh_key_public_keys
  region                      = var.region
  vpc_uuid                    = var.vpc_uuid
  extra_tags                  = var.extra_tags
  admin_email                 = var.admin_email

  # Utils-specific variables
  hostname                    = var.utils_hostname
  size                        = var.utils_size
  image                       = var.utils_image
  fqdn                        = var.utils_fqdn
  root_domain                 = var.root_domain
  manage_dns                  = var.manage_dns
  app_env_content             = var.utils_app_env_content
  
  # Spaces configuration
  spaces_region               = var.spaces_region
  create_cdn_endpoint         = var.create_cdn_endpoint
  spaces_access_key_id        = var.spaces_access_key_id
  spaces_access_key_secret    = var.spaces_access_key_secret
  
  # GitHub configuration
  github_username             = var.github_username
  github_token                = var.github_token
}
