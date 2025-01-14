variable "location" {
  type    = string
  default = "francecentral"
}

variable "resource_group_name" {
  type    = string
  default = "rg-whatsapp-usecase"
}

variable "event_grid_topic_name" {
  type    = string
  default = "UploadEvent"
}

variable "subscription_id" {
  type    = string
  default = "1d874ea7-d53d-4cef-9987-572bff2963ba"
}

variable "tenant_id" {
  type    = string
  default = "d7c4eaa4-f23f-4da8-ac82-79a2732c514f"
}
variable "repository_url" {
  type        = string
  default     = "https://github.com/salahait35/whatsapp_use_case"
}