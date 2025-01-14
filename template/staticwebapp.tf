

resource "azurerm_static_web_app" "static_web_app" {
  name                = "swa-whatsapp-test"
  resource_group_name = azurerm_resource_group.resource_group.name
  location            = "centralus"
  sku_tier = "Standard"
  

  }


resource "azapi_update_resource" "this" {
  count = var.repository_url != null ? 1 : 0

  type = "Microsoft.Web/staticSites@2022-03-01"
  body = {
    properties = {
      repositoryUrl = var.repository_url
      appLocation   = "StaticWebApp"
      branch        =  "main"
    }
  }
  resource_id = azurerm_static_web_app.static_web_app.id

  depends_on = [
    azurerm_static_web_app.static_web_app
  ]
}