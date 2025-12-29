export interface Horse {
  id: string;
  name: string;
  breed?: string;
  birth_date?: string;
  age?: number;
  additional_info?: string;
  photo_path?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateHorseDto {
  name: string;
  breed?: string;
  birth_date?: string;
  additional_info?: string;
}

export interface UpdateHorseDto {
  name?: string;
  breed?: string;
  birth_date?: string;
  additional_info?: string;
}
