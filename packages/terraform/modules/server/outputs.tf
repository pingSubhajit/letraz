output "droplet_ip" {
  description = "The public IP address of the server droplet"
  value       = digitalocean_droplet.server.ipv4_address
}

output "droplet_id" {
  description = "The ID of the server droplet"
  value       = digitalocean_droplet.server.id
}

output "ssh_command_root" {
  description = "SSH command to connect as root user"
  value       = "ssh root@${digitalocean_droplet.server.ipv4_address}"
}

output "ssh_command_letraz" {
  description = "SSH command to connect as letraz user"
  value       = "ssh letraz@${digitalocean_droplet.server.ipv4_address}"
}

output "api_dns_record_id" {
  description = "The ID of the API DNS record (if manage_dns is true)"
  value       = var.manage_dns ? digitalocean_record.api_a[0].id : null
}

output "api_grpc_dns_record_id" {
  description = "The ID of the API gRPC DNS record (if manage_dns is true)"
  value       = var.manage_dns ? digitalocean_record.api_grpc_a[0].id : null
}
