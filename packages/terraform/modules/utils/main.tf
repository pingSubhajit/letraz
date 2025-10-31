terraform {
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

locals {
  droplet_name   = var.hostname
  fqdn           = var.fqdn
  app_dir        = "/home/letraz/app"
  nginx_conf     = "/etc/nginx/sites-available/${var.fqdn}"
  env_path       = "${local.app_dir}/.env"
}

# SSH keys are uploaded at root level and passed via ssh_keys variable

# Random suffix for bucket name
resource "random_id" "spaces_suffix" {
  byte_length = 2
}

# Create Spaces bucket only if access keys are provided
resource "digitalocean_spaces_bucket" "bucket" {
  count  = var.spaces_access_key_id != "" && var.spaces_access_key_secret != "" ? 1 : 0
  name   = "letraz-all-purpose-${random_id.spaces_suffix.hex}"
  region = var.spaces_region
  acl    = "private"
}

# Optional CDN endpoint for the space
resource "digitalocean_cdn" "bucket_cdn" {
  count  = var.create_cdn_endpoint && length(digitalocean_spaces_bucket.bucket) > 0 ? 1 : 0
  origin = "${digitalocean_spaces_bucket.bucket[0].name}.${var.spaces_region}.digitaloceanspaces.com"
}

resource "digitalocean_droplet" "utils" {
  name               = local.droplet_name
  region             = var.region
  size               = var.size
  image              = var.image
  monitoring         = true
  ipv6               = false
  backups            = false
  vpc_uuid           = var.vpc_uuid
  tags               = concat(["name:letraz-utils"], var.extra_tags)
  ssh_keys           = var.ssh_keys

  user_data = templatefile("${path.module}/templates/userdata.sh.tftpl", {
    hostname                    = var.hostname
    fqdn                        = var.fqdn
    admin_email                 = var.admin_email
    app_dir                     = local.app_dir
    env_path                    = local.env_path
    nginx_conf_path             = local.nginx_conf
    nginx_server_name           = var.fqdn
    nginx_upstream_port         = 8080
    env_content_b64             = base64encode(var.app_env_content)
    letraz_authorized_keys_b64  = base64encode(join("\n", var.ssh_key_public_keys))
    bucket_url                  = length(digitalocean_spaces_bucket.bucket) > 0 ? "https://${digitalocean_spaces_bucket.bucket[0].name}.${var.spaces_region}.digitaloceanspaces.com" : ""
    bucket_cdn_endpoint         = length(digitalocean_cdn.bucket_cdn) > 0 ? digitalocean_cdn.bucket_cdn[0].endpoint : ""
    bucket_access_key_id        = var.spaces_access_key_id
    bucket_access_key_secret    = var.spaces_access_key_secret
    bucket_name                 = length(digitalocean_spaces_bucket.bucket) > 0 ? digitalocean_spaces_bucket.bucket[0].name : ""
    bucket_region               = var.spaces_region
    github_username             = var.github_username
    github_token                = var.github_token
  })
}

resource "digitalocean_firewall" "utils" {
  name        = "${var.hostname}-utils-fw"
  droplet_ids = [digitalocean_droplet.utils.id]

  inbound_rule {
    protocol         = "tcp"
    port_range       = "22"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }
  inbound_rule {
    protocol         = "tcp"
    port_range       = "80"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }
  inbound_rule {
    protocol         = "tcp"
    port_range       = "443"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  outbound_rule {
    protocol              = "icmp"
    destination_addresses = ["0.0.0.0/0", "::/0"]
  }
  outbound_rule {
    protocol              = "tcp"
    port_range            = "1-65535"
    destination_addresses = ["0.0.0.0/0", "::/0"]
  }
  outbound_rule {
    protocol              = "udp"
    port_range            = "1-65535"
    destination_addresses = ["0.0.0.0/0", "::/0"]
  }
}

resource "digitalocean_record" "utils_a" {
  count  = var.manage_dns ? 1 : 0
  domain = var.root_domain
  type   = "A"
  name   = replace(local.fqdn, ".${var.root_domain}", "")
  value  = digitalocean_droplet.utils.ipv4_address
  ttl    = 60
}
