using AltinnAccessManager.Server.Configuration;
using AltinnAccessManager.Server.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// Configure ID-porten settings
builder.Services.Configure<IdPortenSettings>(builder.Configuration.GetSection("IdPorten"));

// Configure Altinn Authentication settings
builder.Services.Configure<AltinnAuthenticationSettings>(builder.Configuration.GetSection("AltinnAuthentication"));

// Configure Altinn Metadata settings
builder.Services.Configure<AltinnMetadataSettings>(builder.Configuration.GetSection("AltinnMetadata"));

// Register ID-porten service with HttpClient
builder.Services.AddHttpClient<IIdPortenService, IdPortenService>();

// Register Altinn Authentication service with HttpClient
builder.Services.AddHttpClient<IAltinnAuthenticationService, AltinnAuthenticationService>();

// Register Altinn Metadata service with HttpClient
builder.Services.AddHttpClient<IAltinnMetadataService, AltinnMetadataService>();

var app = builder.Build();

app.UseDefaultFiles();
app.MapStaticAssets();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.MapFallbackToFile("/index.html");

app.Run();
