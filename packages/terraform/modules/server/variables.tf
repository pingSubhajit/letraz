variable "do_token" {
  description = "DigitalOcean API token"
  type        = string
  sensitive   = true
}

variable "ssh_keys" {
  description = "List of SSH key fingerprints or IDs to add to the droplet"
  type        = list(string)
  default     = []
}

variable "ssh_key_public_keys" {
  description = "Optional list of SSH public keys (contents) to upload to DigitalOcean and attach to the droplet (use when you don't have key IDs/fingerprints)."
  type        = list(string)
  default     = []
}

variable "region" {
  description = "DigitalOcean region"
  type        = string
  default     = "sgp1"
}

variable "size" {
  description = "Droplet size slug"
  type        = string
  default     = "s-2vcpu-8gb-160gb-intel"
}

variable "image" {
  description = "Droplet image slug"
  type        = string
  default     = "ubuntu-24-04-x64"
}

variable "vpc_uuid" {
  description = "Optional VPC UUID"
  type        = string
  default     = null
}

variable "extra_tags" {
  description = "Extra tags for the droplet"
  type        = list(string)
  default     = []
}

variable "hostname" {
  description = "Droplet hostname"
  type        = string
  default     = "letraz-server"
}

variable "manage_dns" {
  description = "Whether to create A records in DigitalOcean DNS for the FQDNs"
  type        = bool
  default     = false
}

variable "root_domain" {
  description = "Root domain (e.g., letraz.app) used when manage_dns is true"
  type        = string
  default     = "letraz.app"
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

variable "admin_email" {
  description = "Email for Certbot registration and renewal notices"
  type        = string
}

variable "app_env_content" {
  description = "Content to write to the app .env file"
  type        = string
  sensitive   = true
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
