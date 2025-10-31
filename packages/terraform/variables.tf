# Common variables used by both modules
variable "do_token" {
  description = "DigitalOcean API token"
  type        = string
  sensitive   = true
}

variable "ssh_keys" {
  description = "List of SSH key fingerprints or IDs to add to the droplets"
  type        = list(string)
  default     = []
}

variable "ssh_key_public_keys" {
  description = "Optional list of SSH public keys (contents) to upload to DigitalOcean and attach to the droplets"
  type        = list(string)
  default     = []
}

variable "region" {
  description = "DigitalOcean region"
  type        = string
  default     = "sgp1"
}

variable "vpc_uuid" {
  description = "Optional VPC UUID"
  type        = string
  default     = null
}

variable "extra_tags" {
  description = "Extra tags for the droplets"
  type        = list(string)
  default     = []
}

variable "admin_email" {
  description = "Email for Certbot registration and renewal notices"
  type        = string
}

variable "manage_dns" {
  description = "Whether to create DNS records in DigitalOcean DNS"
  type        = bool
  default     = false
}

variable "root_domain" {
  description = "Root domain (e.g., letraz.app) used when manage_dns is true"
  type        = string
  default     = "letraz.app"
}

# Server module specific variables
variable "server_hostname" {
  description = "Server droplet hostname"
  type        = string
  default     = "letraz-server"
}

variable "server_size" {
  description = "Server droplet size slug"
  type        = string
  default     = "s-2vcpu-8gb-160gb-intel"
}

variable "server_image" {
  description = "Server droplet image slug"
  type        = string
  default     = "ubuntu-24-04-x64"
}

variable "api_fqdn" {
  description = "API HTTP FQDN (e.g., api.letraz.app)"
  type        = string
  default     = "api.letraz.app"
}

variable "api_grpc_fqdn" {
  description = "API gRPC FQDN (e.g., api-grpc.letraz.app)"
  type        = string
  default     = "api-grpc.letraz.app"
}

variable "server_app_env_content" {
  description = "Content to write to the server app .env file"
  type        = string
  sensitive   = true
}

# Utils module specific variables
variable "utils_hostname" {
  description = "Utils droplet hostname"
  type        = string
  default     = "letraz-utils"
}

variable "utils_size" {
  description = "Utils droplet size slug"
  type        = string
  default     = "s-2vcpu-8gb-160gb-intel"
}

variable "utils_image" {
  description = "Utils droplet image slug"
  type        = string
  default     = "ubuntu-24-04-x64"
}

variable "utils_fqdn" {
  description = "Utils service FQDN (e.g., utils.letraz.app)"
  type        = string
  default     = "utils.letraz.app"
}

variable "utils_app_env_content" {
  description = "Content to write to the utils app .env file"
  type        = string
  sensitive   = true
}

# Spaces / CDN configuration
variable "spaces_region" {
  description = "Spaces region (e.g., nyc3). Defaults to droplet region."
  type        = string
  default     = "sgp1"
}

variable "create_cdn_endpoint" {
  description = "Whether to create a CDN endpoint for the space"
  type        = bool
  default     = true
}

variable "spaces_access_key_id" {
  description = "Spaces access key ID"
  type        = string
  sensitive   = true
  default     = ""
}

variable "spaces_access_key_secret" {
  description = "Spaces access key secret"
  type        = string
  sensitive   = true
  default     = ""
}

# GitHub Container Registry credentials (optional)
variable "github_username" {
  description = "GitHub username for ghcr.io login"
  type        = string
  sensitive   = true
  default     = ""
}

variable "github_token" {
  description = "GitHub personal access token for ghcr.io login"
  type        = string
  sensitive   = true
  default     = ""
}
