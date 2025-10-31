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
  default     = "letraz-utils"
}

variable "fqdn" {
  description = "Fully-qualified domain name for the service (e.g., utils.letraz.app)"
  type        = string
}

variable "root_domain" {
  description = "Root domain (e.g., letraz.app) used when manage_dns is true"
  type        = string
  default     = "letraz.app"
}

variable "manage_dns" {
  description = "Whether to create an A record in DigitalOcean DNS for the fqdn"
  type        = bool
  default     = false
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

# Spaces / CDN config
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
  description = "Spaces access key ID to put into .env"
  type        = string
  sensitive   = true
  default     = ""
}

variable "spaces_access_key_secret" {
  description = "Spaces access key secret to put into .env"
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
