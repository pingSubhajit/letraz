output "droplet_ip" {
  description = "The public IP address of the utils droplet"
  value       = digitalocean_droplet.utils.ipv4_address
}

output "droplet_id" {
  description = "The ID of the utils droplet"
  value       = digitalocean_droplet.utils.id
}

output "ssh_command" {
  description = "SSH command to connect as root user"
  value       = "ssh root@${digitalocean_droplet.utils.ipv4_address}"
}

output "ssh_command_letraz" {
  description = "SSH command to connect as letraz user"
  value       = "ssh letraz@${digitalocean_droplet.utils.ipv4_address}"
}

output "spaces_bucket_name" {
  description = "The name of the created Spaces bucket"
  value       = length(digitalocean_spaces_bucket.bucket) > 0 ? digitalocean_spaces_bucket.bucket[0].name : null
}

output "spaces_bucket_url" {
  description = "The URL of the created Spaces bucket"
  value       = length(digitalocean_spaces_bucket.bucket) > 0 ? "https://${digitalocean_spaces_bucket.bucket[0].name}.${var.spaces_region}.digitaloceanspaces.com" : null
}

output "spaces_cdn_endpoint" {
  description = "The CDN endpoint for the Spaces bucket (if created)"
  value       = length(digitalocean_cdn.bucket_cdn) > 0 ? digitalocean_cdn.bucket_cdn[0].endpoint : null
}

output "utils_dns_record_id" {
  description = "The ID of the utils DNS record (if manage_dns is true)"
  value       = var.manage_dns ? digitalocean_record.utils_a[0].id : null
}
