export const swaggerSpec = {
    openapi: "3.0.3",
    info: {
        title: "Equilife API",
        version: "1.0.0",
        description: "Documentation de l'API Equilife.",
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
        { name: "Product", description: "Produit" },
        { name: "Horses", description: "Chevaux" },
        { name: "Documents", description: "Documents" },
        { name: "Rations", description: "Rations" },
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
                    horse_id: {
                        type: "string",
                        format: "uuid",
                        nullable: true,
                    },
                    product_id: {
                        type: "string",
                        format: "uuid",
                        nullable: true,
                    },
                    is_care: { type: "boolean", nullable: true },
                    reminder_type: {
                        type: "string",
                        nullable: true,
                        enum: ["soin", "activité", "alimentation", "autres"],
                    },
                    activity_type: { type: "string", nullable: true },
                    activity_duration_minutes: {
                        type: "integer",
                        nullable: true,
                    },
                    activity_intensity: {
                        type: "string",
                        nullable: true,
                        enum: ["legere", "normale", "soutenue"],
                    },
                    activity_comment: { type: "string", nullable: true },
                    reminder_enabled: { type: "boolean" },
                    reminder_interval_days: { type: "integer", nullable: true },
                    reminder_interval_months: {
                        type: "integer",
                        nullable: true,
                    },
                    reminder_interval_years: {
                        type: "integer",
                        nullable: true,
                    },
                    last_reminder_date: {
                        type: "string",
                        format: "date",
                        nullable: true,
                    },
                    next_reminder_date: {
                        type: "string",
                        format: "date",
                        nullable: true,
                    },
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
                    horse_id: {
                        type: "string",
                        format: "uuid",
                        nullable: true,
                    },
                    product_id: {
                        type: "string",
                        format: "uuid",
                        nullable: true,
                    },
                    is_care: { type: "boolean", nullable: true },
                    reminder_type: {
                        type: "string",
                        nullable: true,
                        enum: ["soin", "activité", "alimentation", "autres"],
                    },
                    activity_type: { type: "string", nullable: true },
                    activity_duration_minutes: {
                        type: "integer",
                        nullable: true,
                    },
                    activity_intensity: {
                        type: "string",
                        nullable: true,
                        enum: ["legere", "normale", "soutenue"],
                    },
                    activity_comment: { type: "string", nullable: true },
                    reminder_enabled: { type: "boolean" },
                    reminder_interval_days: { type: "integer", nullable: true },
                    reminder_interval_months: {
                        type: "integer",
                        nullable: true,
                    },
                    reminder_interval_years: {
                        type: "integer",
                        nullable: true,
                    },
                },
            },
            UpdateEventDto: {
                type: "object",
                properties: {
                    name: { type: "string" },
                    description: { type: "string", nullable: true },
                    event_date: { type: "string", format: "date" },
                    horse_id: {
                        type: "string",
                        format: "uuid",
                        nullable: true,
                    },
                    product_id: {
                        type: "string",
                        format: "uuid",
                        nullable: true,
                    },
                    is_care: { type: "boolean", nullable: true },
                    reminder_type: {
                        type: "string",
                        nullable: true,
                        enum: ["soin", "activité", "alimentation", "autres"],
                    },
                    activity_type: { type: "string", nullable: true },
                    activity_duration_minutes: {
                        type: "integer",
                        nullable: true,
                    },
                    activity_intensity: {
                        type: "string",
                        nullable: true,
                        enum: ["legere", "normale", "soutenue"],
                    },
                    activity_comment: { type: "string", nullable: true },
                    reminder_enabled: { type: "boolean" },
                    reminder_interval_days: { type: "integer", nullable: true },
                    reminder_interval_months: {
                        type: "integer",
                        nullable: true,
                    },
                    reminder_interval_years: {
                        type: "integer",
                        nullable: true,
                    },
                },
            },
            Product: {
                type: "object",
                properties: {
                    id: { type: "string", format: "uuid" },
                    name: { type: "string" },
                    description: { type: "string", nullable: true },
                    category: { type: "string", nullable: true },
                    brand: { type: "string", nullable: true },
                    note: { type: "string", nullable: true },
                    last_purchase_date: {
                        type: "string",
                        format: "date",
                        nullable: true,
                    },
                    purchase_interval_months: {
                        type: "integer",
                        nullable: true,
                    },
                    purchase_interval_years: {
                        type: "integer",
                        nullable: true,
                    },
                    estimated_cost: { type: "number", nullable: true },
                    horse_id: {
                        type: "string",
                        format: "uuid",
                        nullable: true,
                    },
                    used_for_horses: {
                        type: "array",
                        items: { type: "string" },
                    },
                    needs_repurchase: { type: "boolean" },
                    is_active: { type: "boolean" },
                    created_at: { type: "string", format: "date-time" },
                    updated_at: { type: "string", format: "date-time" },
                },
            },
            CreateProductDto: {
                type: "object",
                required: ["name"],
                properties: {
                    name: { type: "string" },
                    description: { type: "string", nullable: true },
                    category: { type: "string", nullable: true },
                    brand: { type: "string", nullable: true },
                    note: { type: "string", nullable: true },
                    last_purchase_date: {
                        type: "string",
                        format: "date",
                        nullable: true,
                    },
                    purchase_interval_months: {
                        type: "integer",
                        nullable: true,
                    },
                    purchase_interval_years: {
                        type: "integer",
                        nullable: true,
                    },
                    estimated_cost: { type: "number", nullable: true },
                    horse_id: {
                        type: "string",
                        format: "uuid",
                        nullable: true,
                    },
                    used_for_horses: {
                        type: "array",
                        items: { type: "string" },
                    },
                    needs_repurchase: { type: "boolean" },
                },
            },
            UpdateProductDto: {
                type: "object",
                properties: {
                    name: { type: "string" },
                    description: { type: "string", nullable: true },
                    category: { type: "string", nullable: true },
                    brand: { type: "string", nullable: true },
                    note: { type: "string", nullable: true },
                    last_purchase_date: {
                        type: "string",
                        format: "date",
                        nullable: true,
                    },
                    purchase_interval_months: {
                        type: "integer",
                        nullable: true,
                    },
                    purchase_interval_years: {
                        type: "integer",
                        nullable: true,
                    },
                    estimated_cost: { type: "number", nullable: true },
                    horse_id: {
                        type: "string",
                        format: "uuid",
                        nullable: true,
                    },
                    used_for_horses: {
                        type: "array",
                        items: { type: "string" },
                    },
                    needs_repurchase: { type: "boolean" },
                    is_active: { type: "boolean" },
                },
            },
            Horse: {
                type: "object",
                properties: {
                    id: { type: "string", format: "uuid" },
                    name: { type: "string" },
                    sex: {
                        type: "string",
                        nullable: true,
                        enum: ["Jument", "Hongre", "Etalon"],
                    },
                    breed: { type: "string", nullable: true },
                    coat: { type: "string", nullable: true },
                    birth_date: {
                        type: "string",
                        format: "date",
                        nullable: true,
                    },
                    age: { type: "integer", nullable: true },
                    stable_location: { type: "string", nullable: true },
                    feed: { type: "string", nullable: true },
                    additional_info: { type: "string", nullable: true },
                    photo_path: { type: "string", nullable: true },
                    created_at: { type: "string", format: "date-time" },
                    updated_at: { type: "string", format: "date-time" },
                },
            },
            Document: {
                type: "object",
                properties: {
                    id: { type: "string", format: "uuid" },
                    horse_id: { type: "string", format: "uuid" },
                    title: { type: "string" },
                    document_date: {
                        type: "string",
                        format: "date",
                        nullable: true,
                    },
                    tag: {
                        type: "string",
                        nullable: true,
                        enum: [
                            "carte_immatriculation",
                            "certificats",
                            "ordonnances",
                            "factures",
                            "assurance",
                            "autres",
                        ],
                    },
                    file_path: { type: "string" },
                    note: { type: "string", nullable: true },
                    created_at: { type: "string", format: "date-time" },
                    updated_at: { type: "string", format: "date-time" },
                },
            },
            Ration: {
                type: "object",
                properties: {
                    id: { type: "string", format: "uuid" },
                    horse_id: { type: "string", format: "uuid" },
                    name: { type: "string" },
                    start_date: {
                        type: "string",
                        format: "date",
                        nullable: true,
                    },
                    end_date: {
                        type: "string",
                        format: "date",
                        nullable: true,
                    },
                    note: { type: "string", nullable: true },
                    is_active: { type: "boolean" },
                    items: {
                        type: "array",
                        items: { $ref: "#/components/schemas/RationItem" },
                    },
                    created_at: { type: "string", format: "date-time" },
                    updated_at: { type: "string", format: "date-time" },
                },
            },
            RationItem: {
                type: "object",
                properties: {
                    id: { type: "string", format: "uuid" },
                    ration_id: { type: "string", format: "uuid" },
                    product_id: {
                        type: "string",
                        format: "uuid",
                        nullable: true,
                    },
                    quantity: { type: "string", nullable: true },
                    frequency: { type: "array", items: { type: "string" } },
                    type: {
                        type: "string",
                        nullable: true,
                        enum: ["Granulés", "Complément", "Autres"],
                    },
                    created_at: { type: "string", format: "date-time" },
                    updated_at: { type: "string", format: "date-time" },
                },
            },
            CreateHorseDto: {
                type: "object",
                required: ["name"],
                properties: {
                    name: { type: "string" },
                    sex: {
                        type: "string",
                        nullable: true,
                        enum: ["Jument", "Hongre", "Etalon"],
                    },
                    breed: { type: "string", nullable: true },
                    coat: { type: "string", nullable: true },
                    birth_date: {
                        type: "string",
                        format: "date",
                        nullable: true,
                    },
                    stable_location: { type: "string", nullable: true },
                    feed: { type: "string", nullable: true },
                    additional_info: { type: "string", nullable: true },
                },
            },
            UpdateHorseDto: {
                type: "object",
                properties: {
                    name: { type: "string" },
                    sex: {
                        type: "string",
                        nullable: true,
                        enum: ["Jument", "Hongre", "Etalon"],
                    },
                    breed: { type: "string", nullable: true },
                    coat: { type: "string", nullable: true },
                    birth_date: {
                        type: "string",
                        format: "date",
                        nullable: true,
                    },
                    stable_location: { type: "string", nullable: true },
                    feed: { type: "string", nullable: true },
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
                                schema: {
                                    type: "array",
                                    items: {
                                        $ref: "#/components/schemas/Event",
                                    },
                                },
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
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/CreateEventDto",
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: "Événement créé",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Event" },
                            },
                        },
                    },
                    500: {
                        description: "Erreur serveur",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
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
                                schema: {
                                    type: "array",
                                    items: {
                                        $ref: "#/components/schemas/Event",
                                    },
                                },
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
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: { type: "string" },
                    },
                ],
                responses: {
                    200: {
                        description: "Événement",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Event" },
                            },
                        },
                    },
                    404: {
                        description: "Non trouvé",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                },
            },
            put: {
                tags: ["Events"],
                summary: "Mettre à jour un événement",
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: { type: "string" },
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/UpdateEventDto",
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: "Événement mis à jour",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Event" },
                            },
                        },
                    },
                    404: {
                        description: "Non trouvé",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                },
            },
            delete: {
                tags: ["Events"],
                summary: "Supprimer un événement",
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: { type: "string" },
                    },
                ],
                responses: {
                    204: { description: "Supprimé" },
                    404: {
                        description: "Non trouvé",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                },
            },
        },
        "/api/products": {
            get: {
                tags: ["Product"],
                summary: "Liste des produits actif",
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
                        description: "Liste des produits",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "array",
                                    items: {
                                        $ref: "#/components/schemas/Product",
                                    },
                                },
                            },
                        },
                    },
                },
            },
            post: {
                tags: ["Product"],
                summary: "Créer un produit",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/CreateProductDto",
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: "Produit créé",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/Product",
                                },
                            },
                        },
                    },
                },
            },
        },
        "/api/products/due-for-purchase": {
            get: {
                tags: ["Product"],
                summary: "Lister les produits à acheter",
                responses: {
                    200: {
                        description: "Liste des produits à acheter",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "array",
                                    items: {
                                        $ref: "#/components/schemas/Product",
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        "/api/product/{id}": {
            get: {
                tags: ["Product"],
                summary: "Récupérer un produit",
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: { type: "string" },
                    },
                ],
                responses: {
                    200: {
                        description: "Product",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/Product",
                                },
                            },
                        },
                    },
                    404: {
                        description: "Non trouvé",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                },
            },
            put: {
                tags: ["Product"],
                summary: "Mettre à jour un produit",
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: { type: "string" },
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/UpdateProductDto",
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: "Produit mis à jour",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/Product",
                                },
                            },
                        },
                    },
                },
            },
            delete: {
                tags: ["Product"],
                summary: "Supprimer un produit",
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: { type: "string" },
                    },
                ],
                responses: {
                    204: { description: "Supprimé" },
                },
            },
        },
        "/api/product/{id}/purchase": {
            post: {
                tags: ["Product"],
                summary: "Marquer un produit comme acheté",
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: { type: "string" },
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    purchaseDate: {
                                        type: "string",
                                        format: "date",
                                    },
                                },
                                required: ["purchaseDate"],
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: "Produit mis à jour",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/Product",
                                },
                            },
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
                                schema: {
                                    type: "array",
                                    items: {
                                        $ref: "#/components/schemas/Horse",
                                    },
                                },
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
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/CreateHorseDto",
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: "Cheval créé",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Horse" },
                            },
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
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Horse" },
                            },
                        },
                    },
                },
            },
        },
        "/api/horses/{id}": {
            get: {
                tags: ["Horses"],
                summary: "Récupérer un cheval",
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: { type: "string" },
                    },
                ],
                responses: {
                    200: {
                        description: "Cheval",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Horse" },
                            },
                        },
                    },
                    404: {
                        description: "Non trouvé",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                            },
                        },
                    },
                },
            },
            put: {
                tags: ["Horses"],
                summary: "Mettre à jour un cheval",
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: { type: "string" },
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/UpdateHorseDto",
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: "Cheval mis à jour",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Horse" },
                            },
                        },
                    },
                },
            },
            delete: {
                tags: ["Horses"],
                summary: "Supprimer un cheval",
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: { type: "string" },
                    },
                ],
                responses: {
                    204: { description: "Supprimé" },
                },
            },
        },
        "/api/horses/{id}/photo": {
            post: {
                tags: ["Horses"],
                summary: "Uploader une photo",
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: { type: "string" },
                    },
                ],
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
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Horse" },
                            },
                        },
                    },
                },
            },
        },
        "/api/documents": {
            get: {
                tags: ["Documents"],
                summary: "Lister les documents",
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
                        description: "Liste des documents",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "array",
                                    items: {
                                        $ref: "#/components/schemas/Document",
                                    },
                                },
                            },
                        },
                    },
                },
            },
            post: {
                tags: ["Documents"],
                summary: "Créer un document",
                requestBody: {
                    required: true,
                    content: {
                        "multipart/form-data": {
                            schema: {
                                type: "object",
                                properties: {
                                    horse_id: { type: "string" },
                                    title: { type: "string" },
                                    document_date: {
                                        type: "string",
                                        format: "date",
                                    },
                                    tag: {
                                        type: "string",
                                        enum: [
                                            "carte_immatriculation",
                                            "certificats",
                                            "ordonnances",
                                            "factures",
                                            "assurance",
                                            "autres",
                                        ],
                                    },
                                    note: { type: "string" },
                                    file: { type: "string", format: "binary" },
                                },
                                required: ["horse_id", "title", "file"],
                            },
                        },
                    },
                },
                responses: {
                    201: {
                        description: "Document créé",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/Document",
                                },
                            },
                        },
                    },
                },
            },
        },
        "/api/documents/{id}": {
            delete: {
                tags: ["Documents"],
                summary: "Supprimer un document",
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: { type: "string" },
                    },
                ],
                responses: {
                    204: { description: "Supprimé" },
                    404: { description: "Non trouvé" },
                },
            },
        },
        "/api/rations": {
            get: {
                tags: ["Rations"],
                summary: "Lister les rations",
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
                        description: "Liste des rations",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "array",
                                    items: {
                                        $ref: "#/components/schemas/Ration",
                                    },
                                },
                            },
                        },
                    },
                },
            },
            post: {
                tags: ["Rations"],
                summary: "Créer une ration",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["horse_id", "name", "items"],
                                properties: {
                                    horse_id: { type: "string" },
                                    name: { type: "string" },
                                    start_date: {
                                        type: "string",
                                        format: "date",
                                    },
                                    end_date: {
                                        type: "string",
                                        format: "date",
                                    },
                                    note: { type: "string" },
                                    is_active: { type: "boolean" },
                                    items: {
                                        type: "array",
                                        items: {
                                            $ref: "#/components/schemas/RationItem",
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                responses: {
                    201: {
                        description: "Ration créée",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Ration" },
                            },
                        },
                    },
                },
            },
        },
    },
} as const;
