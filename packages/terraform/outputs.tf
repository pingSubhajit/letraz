# Server module outputs
output "server_droplet_ip" {
  description = "The public IP address of the server droplet"
  value       = module.server.droplet_ip
}

output "server_droplet_id" {
  description = "The ID of the server droplet"
  value       = module.server.droplet_id
}

output "server_ssh_command_root" {
  description = "SSH command to connect to server as root user"
  value       = module.server.ssh_command_root
}

output "server_ssh_command_letraz" {
  description = "SSH command to connect to server as letraz user"
  value       = module.server.ssh_command_letraz
}

# Utils module outputs
output "utils_droplet_ip" {
  description = "The public IP address of the utils droplet"
  value       = module.utils.droplet_ip
}

output "utils_droplet_id" {
  description = "The ID of the utils droplet"
  value       = module.utils.droplet_id
}

output "utils_ssh_command_root" {
  description = "SSH command to connect to utils as root user"
  value       = module.utils.ssh_command
}

output "utils_ssh_command_letraz" {
  description = "SSH command to connect to utils as letraz user"
  value       = module.utils.ssh_command_letraz
}

output "spaces_bucket_name" {
  description = "The name of the created Spaces bucket"
  value       = module.utils.spaces_bucket_name
}

output "spaces_bucket_url" {
  description = "The URL of the created Spaces bucket"
  value       = module.utils.spaces_bucket_url
}

output "spaces_cdn_endpoint" {
  description = "The CDN endpoint for the Spaces bucket (if created)"
  value       = module.utils.spaces_cdn_endpoint
}

# Consolidated convenience outputs
output "all_droplet_ips" {
  description = "Map of all droplet IPs"
  value = {
    server = module.server.droplet_ip
    utils  = module.utils.droplet_ip
  }
}

output "all_ssh_commands" {
  description = "All SSH commands for quick access"
  value = {
    server_root   = module.server.ssh_command_root
    server_letraz = module.server.ssh_command_letraz
    utils_root    = module.utils.ssh_command
    utils_letraz  = module.utils.ssh_command_letraz
  }
}
