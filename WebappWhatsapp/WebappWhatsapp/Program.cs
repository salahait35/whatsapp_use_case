using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.Authorization;
using Microsoft.Identity.Web;
using Microsoft.Identity.Web.UI;
using Microsoft.Azure.SignalR;
using WebappWhatsapp.Models;

var builder = WebApplication.CreateBuilder(args);

// Configure logging
builder.Logging.ClearProviders();
builder.Logging.AddConsole();


// Configure CosmosDbService with container names
builder.Services.AddSingleton<ICosmosDbService>(sp =>
{
    var containerNames = builder.Configuration.GetSection("CosmosDb:Containers").Get<Dictionary<string, string>>();
    return new CosmosDbService(
        builder.Configuration["CosmosDb:AccountEndpoint"],
        builder.Configuration["CosmosDb:DatabaseName"],
        containerNames
    );
});
builder.Services.AddSignalR(options =>
{
    options.KeepAliveInterval = TimeSpan.FromMinutes(2);
    options.ClientTimeoutInterval = TimeSpan.FromMinutes(3);
});

// Configure authentication and authorization
builder.Services.AddAuthentication(OpenIdConnectDefaults.AuthenticationScheme)
    .AddMicrosoftIdentityWebApp(builder.Configuration.GetSection("AzureAd"));

builder.Services.AddControllersWithViews(options =>
{
    var policy = new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build();
    options.Filters.Add(new AuthorizeFilter(policy));
});

builder.Services.AddRazorPages()
    .AddMicrosoftIdentityUI();

builder.Services.AddSignalR().AddAzureSignalR(builder.Configuration["Azure:SignalR:ConnectionString"]);

// Build the app
var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");
app.MapRazorPages();
app.MapHub<ChatHub>("/chatHub");

app.Run();
