﻿using Azure.Identity;
using Microsoft.Azure.Cosmos;
using Newtonsoft.Json;
using System;
using System.Threading.Tasks;

namespace WebappWhatsapp.Models
{
    // Définition de l'interface pour le service Cosmos DB
    public interface ICosmosDbService
    {
        Task AddUserAsync(User user); // Méthode pour ajouter un utilisateur
    }



    // Implémentation du service Cosmos DB
    public class CosmosDbService : ICosmosDbService
    {
        private readonly Container _container;

        public CosmosDbService(string accountEndpoint, string databaseName, string containerName)
        {
            // Utilisation d'un jeton AAD via DefaultAzureCredential
            var aadCredential = new DefaultAzureCredential();
            var cosmosClient = new CosmosClient(accountEndpoint, aadCredential);
            _container = cosmosClient.GetContainer(databaseName, containerName);
        }

        public async Task AddUserAsync(User user)
        {
            if (user == null)
                throw new ArgumentNullException(nameof(user));

            // S'assurer que l'ID est défini
            if (string.IsNullOrEmpty(user.id))
            {
                user.id = user.Email; // Par défaut, utiliser l'email comme identifiant
            }

            try
            {
                // Vérifier si un utilisateur avec cet ID existe déjà
                var existingUser = await _container.ReadItemAsync<User>(user.id, new PartitionKey(user.id));
                if (existingUser != null)
                {
                    throw new Exception($"Un utilisateur avec l'ID {user.id} existe déjà.");
                }
            }
            catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                // Si l'utilisateur n'existe pas, ajouter le nouvel utilisateur
                await _container.CreateItemAsync(user, new PartitionKey(user.id));
            }
        }

    }
}
