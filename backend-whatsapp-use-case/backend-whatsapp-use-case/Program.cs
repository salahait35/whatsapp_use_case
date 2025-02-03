using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Identity.Web;
using WebappWhatsapp.Models;
using Azure.Identity;
using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Authentication;

var builder = WebApplication.CreateBuilder(args);

// Configure Cosmos DB client with Managed Identity
builder.Services.AddSingleton<ICosmosDbService>(sp =>
{
    var containerNames = builder.Configuration.GetSection("CosmosDb:Containers").Get<Dictionary<string, string>>();
    var cosmosClient = new CosmosClient(builder.Configuration["CosmosDb:AccountEndpoint"], new DefaultAzureCredential());
    return new CosmosDbService(
        cosmosClient,
        builder.Configuration["CosmosDb:DatabaseName"],
        containerNames
    );
});

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddMicrosoftIdentityWebApi(builder.Configuration.GetSection("AzureAd"));

// Add services to the container.


builder.Services.AddControllers();

// Add CORS policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowLocalhost",
        builder =>
        {
            builder.WithOrigins("https://theptalks.net") // Remplace par l'URL de ton SWA en local
                   .AllowAnyHeader()
                   .AllowAnyMethod();
        });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseHttpsRedirection();

app.UseAuthentication();

app.UseAuthorization();

// Use CORS policy
app.UseCors("AllowLocalhost");

app.MapControllers();

app.Run();