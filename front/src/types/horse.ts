export interface Horse {
  id: string;
  name: string;
  nickname?: string;
  sex?: 'Jument' | 'Hongre' | 'Etalon';
  breed?: string;
  coat?: string;
  birth_date?: string;
  age?: number;
  stable_location?: string;
  feed?: string;
  additional_info?: string;
  photo_path?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateHorseDto {
  name: string;
  nickname?: string;
  sex?: 'Jument' | 'Hongre' | 'Etalon';
  breed?: string;
  coat?: string;
  birth_date?: string;
  stable_location?: string;
  feed?: string;
  additional_info?: string;
}

export interface UpdateHorseDto {
  name?: string;
  nickname?: string;
  sex?: 'Jument' | 'Hongre' | 'Etalon';
  breed?: string;
  coat?: string;
  birth_date?: string;
  stable_location?: string;
  feed?: string;
  additional_info?: string;
}
