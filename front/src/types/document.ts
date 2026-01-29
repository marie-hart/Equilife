export interface Document {
    id: string;
    horse_id: string;
    title: string;
    document_date?: string;
    tag?:
        | "carte_immatriculation"
        | "certificats"
        | "ordonnances"
        | "factures"
        | "assurance"
        | "autres";
    file_path: string;
    note?: string;
    created_at: string;
    updated_at: string;
}

export interface CreateDocumentDto {
    horse_id: string;
    title: string;
    document_date?: string;
    tag?:
        | "carte_immatriculation"
        | "certificats"
        | "ordonnances"
        | "factures"
        | "assurance"
        | "autres";
    note?: string;
    file: File;
}
