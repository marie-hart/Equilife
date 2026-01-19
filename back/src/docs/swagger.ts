export const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: "Horse Care App API",
    version: "1.0.0",
    description: "Documentation de l'API Horse Care App.",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Local",
    },
  ],
  tags: [
    { name: "Health", description: "Statut des services" },
    { name: "Events", description: "Événements et rappels" },
    { name: "Materials", description: "Matériel" },
    { name: "Horses", description: "Chevaux" },
  ],
  components: {
    schemas: {
      Event: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
          description: { type: "string", nullable: true },
          event_date: { type: "string", format: "date" },
          horse_id: { type: "string", format: "uuid", nullable: true },
          reminder_enabled: { type: "boolean" },
          reminder_interval_months: { type: "integer", nullable: true },
          reminder_interval_years: { type: "integer", nullable: true },
          last_reminder_date: { type: "string", format: "date", nullable: true },
          next_reminder_date: { type: "string", format: "date", nullable: true },
          created_at: { type: "string", format: "date-time" },
          updated_at: { type: "string", format: "date-time" },
        },
      },
      CreateEventDto: {
        type: "object",
        required: ["name", "event_date"],
        properties: {
          name: { type: "string" },
          description: { type: "string", nullable: true },
          event_date: { type: "string", format: "date" },
          horse_id: { type: "string", format: "uuid", nullable: true },
          reminder_enabled: { type: "boolean" },
          reminder_interval_months: { type: "integer", nullable: true },
          reminder_interval_years: { type: "integer", nullable: true },
        },
      },
      UpdateEventDto: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string", nullable: true },
          event_date: { type: "string", format: "date" },
          horse_id: { type: "string", format: "uuid", nullable: true },
          reminder_enabled: { type: "boolean" },
          reminder_interval_months: { type: "integer", nullable: true },
          reminder_interval_years: { type: "integer", nullable: true },
        },
      },
      Material: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
          description: { type: "string", nullable: true },
          last_purchase_date: { type: "string", format: "date", nullable: true },
          purchase_interval_months: { type: "integer", nullable: true },
          purchase_interval_years: { type: "integer", nullable: true },
          estimated_cost: { type: "number", nullable: true },
          horse_id: { type: "string", format: "uuid", nullable: true },
          is_active: { type: "boolean" },
          created_at: { type: "string", format: "date-time" },
          updated_at: { type: "string", format: "date-time" },
        },
      },
      CreateMaterialDto: {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string" },
          description: { type: "string", nullable: true },
          last_purchase_date: { type: "string", format: "date", nullable: true },
          purchase_interval_months: { type: "integer", nullable: true },
          purchase_interval_years: { type: "integer", nullable: true },
          estimated_cost: { type: "number", nullable: true },
          horse_id: { type: "string", format: "uuid", nullable: true },
        },
      },
      UpdateMaterialDto: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string", nullable: true },
          last_purchase_date: { type: "string", format: "date", nullable: true },
          purchase_interval_months: { type: "integer", nullable: true },
          purchase_interval_years: { type: "integer", nullable: true },
          estimated_cost: { type: "number", nullable: true },
          horse_id: { type: "string", format: "uuid", nullable: true },
          is_active: { type: "boolean" },
        },
      },
      Horse: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
          breed: { type: "string", nullable: true },
          birth_date: { type: "string", format: "date", nullable: true },
          age: { type: "integer", nullable: true },
          additional_info: { type: "string", nullable: true },
          photo_path: { type: "string", nullable: true },
          created_at: { type: "string", format: "date-time" },
          updated_at: { type: "string", format: "date-time" },
        },
      },
      CreateHorseDto: {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string" },
          breed: { type: "string", nullable: true },
          birth_date: { type: "string", format: "date", nullable: true },
          additional_info: { type: "string", nullable: true },
        },
      },
      UpdateHorseDto: {
        type: "object",
        properties: {
          name: { type: "string" },
          breed: { type: "string", nullable: true },
          birth_date: { type: "string", format: "date", nullable: true },
          additional_info: { type: "string", nullable: true },
        },
      },
      Error: {
        type: "object",
        properties: {
          error: { type: "string" },
        },
      },
    },
  },
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Health check",
        responses: {
          200: {
            description: "Statut des services",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string" },
                    database: { type: "string" },
                    redis: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/events": {
      get: {
        tags: ["Events"],
        summary: "Lister les événements",
        parameters: [
          {
            name: "horseId",
            in: "query",
            required: false,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Liste des événements",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/Event" } },
              },
            },
          },
        },
      },
      post: {
        tags: ["Events"],
        summary: "Créer un événement",
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/CreateEventDto" } },
          },
        },
        responses: {
          200: {
            description: "Événement créé",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Event" } },
            },
          },
          500: { description: "Erreur serveur", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },
    "/api/events/reminders": {
      get: {
        tags: ["Events"],
        summary: "Lister les rappels",
        parameters: [
          {
            name: "horseId",
            in: "query",
            required: false,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Liste des rappels",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/Event" } },
              },
            },
          },
        },
      },
    },
    "/api/events/{id}": {
      get: {
        tags: ["Events"],
        summary: "Récupérer un événement",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: {
            description: "Événement",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Event" } },
            },
          },
          404: { description: "Non trouvé", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
      put: {
        tags: ["Events"],
        summary: "Mettre à jour un événement",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/UpdateEventDto" } },
          },
        },
        responses: {
          200: {
            description: "Événement mis à jour",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Event" } },
            },
          },
          404: { description: "Non trouvé", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
      delete: {
        tags: ["Events"],
        summary: "Supprimer un événement",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          204: { description: "Supprimé" },
          404: { description: "Non trouvé", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },
    "/api/materials": {
      get: {
        tags: ["Materials"],
        summary: "Lister le matériel actif",
        parameters: [
          {
            name: "horseId",
            in: "query",
            required: false,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Liste du matériel",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/Material" } },
              },
            },
          },
        },
      },
      post: {
        tags: ["Materials"],
        summary: "Créer un matériel",
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/CreateMaterialDto" } },
          },
        },
        responses: {
          200: {
            description: "Matériel créé",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Material" } },
            },
          },
        },
      },
    },
    "/api/materials/due-for-purchase": {
      get: {
        tags: ["Materials"],
        summary: "Lister le matériel à acheter",
        responses: {
          200: {
            description: "Liste du matériel à acheter",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/Material" } },
              },
            },
          },
        },
      },
    },
    "/api/materials/{id}": {
      get: {
        tags: ["Materials"],
        summary: "Récupérer un matériel",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: {
            description: "Matériel",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Material" } },
            },
          },
          404: { description: "Non trouvé", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
      put: {
        tags: ["Materials"],
        summary: "Mettre à jour un matériel",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/UpdateMaterialDto" } },
          },
        },
        responses: {
          200: {
            description: "Matériel mis à jour",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Material" } },
            },
          },
        },
      },
      delete: {
        tags: ["Materials"],
        summary: "Désactiver un matériel",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          204: { description: "Désactivé" },
        },
      },
    },
    "/api/materials/{id}/purchase": {
      post: {
        tags: ["Materials"],
        summary: "Marquer un matériel comme acheté",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  purchaseDate: { type: "string", format: "date" },
                },
                required: ["purchaseDate"],
              },
            },
          },
        },
        responses: {
          200: {
            description: "Matériel mis à jour",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Material" } },
            },
          },
        },
      },
    },
    "/api/horses": {
      get: {
        tags: ["Horses"],
        summary: "Lister les chevaux",
        responses: {
          200: {
            description: "Liste des chevaux",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/Horse" } },
              },
            },
          },
        },
      },
      post: {
        tags: ["Horses"],
        summary: "Créer un cheval",
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/CreateHorseDto" } },
          },
        },
        responses: {
          200: {
            description: "Cheval créé",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Horse" } },
            },
          },
        },
      },
    },
    "/api/horses/first": {
      get: {
        tags: ["Horses"],
        summary: "Récupérer le premier cheval",
        responses: {
          200: {
            description: "Cheval",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Horse" } },
            },
          },
        },
      },
    },
    "/api/horses/{id}": {
      get: {
        tags: ["Horses"],
        summary: "Récupérer un cheval",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: {
            description: "Cheval",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Horse" } },
            },
          },
          404: { description: "Non trouvé", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
      put: {
        tags: ["Horses"],
        summary: "Mettre à jour un cheval",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/UpdateHorseDto" } },
          },
        },
        responses: {
          200: {
            description: "Cheval mis à jour",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Horse" } },
            },
          },
        },
      },
      delete: {
        tags: ["Horses"],
        summary: "Supprimer un cheval",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          204: { description: "Supprimé" },
        },
      },
    },
    "/api/horses/{id}/photo": {
      post: {
        tags: ["Horses"],
        summary: "Uploader une photo",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  photo: { type: "string", format: "binary" },
                },
                required: ["photo"],
              },
            },
          },
        },
        responses: {
          200: {
            description: "Cheval mis à jour",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Horse" } },
            },
          },
        },
      },
    },
  },
} as const;
