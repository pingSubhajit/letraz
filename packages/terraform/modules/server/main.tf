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
  droplet_name = var.hostname
  app_dir      = "/home/letraz/app"
  env_path     = "${local.app_dir}/.env"
}

# SSH keys are uploaded at root level and passed via ssh_keys variable

resource "digitalocean_droplet" "server" {
  name       = local.droplet_name
  region     = var.region
  size       = var.size
  image      = var.image
  monitoring = true
  ipv6       = false
  backups    = false
  vpc_uuid   = var.vpc_uuid
  tags       = concat(["name:letraz-server"], var.extra_tags)
  ssh_keys   = var.ssh_keys

  user_data = templatefile("${path.module}/templates/userdata.sh.tftpl", {
    hostname                    = var.hostname
    admin_email                 = var.admin_email
    app_dir                     = local.app_dir
    env_path                    = local.env_path
    env_content_b64             = base64encode(var.app_env_content)
    letraz_authorized_keys_b64  = base64encode(join("\n", var.ssh_key_public_keys))
    api_fqdn                    = var.api_fqdn
    api_grpc_fqdn               = var.api_grpc_fqdn
    github_username             = var.github_username
    github_token                = var.github_token
  })
}

resource "digitalocean_firewall" "server_fw" {
  name        = "${var.hostname}-server-fw"
  droplet_ids = [digitalocean_droplet.server.id]

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

resource "digitalocean_record" "api_a" {
  count  = var.manage_dns ? 1 : 0
  domain = var.root_domain
  type   = "A"
  name   = replace(var.api_fqdn, ".${var.root_domain}", "")
  value  = digitalocean_droplet.server.ipv4_address
  ttl    = 60
}

resource "digitalocean_record" "api_grpc_a" {
  count  = var.manage_dns ? 1 : 0
  domain = var.root_domain
  type   = "A"
  name   = replace(var.api_grpc_fqdn, ".${var.root_domain}", "")
  value  = digitalocean_droplet.server.ipv4_address
  ttl    = 60
}
