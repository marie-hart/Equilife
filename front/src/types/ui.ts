export interface Care {
  id: string;
  name: string;
  time: string;
}

export interface Task {
  id: string;
  name: string;
  completed: boolean;
}

export interface Food {
  id: string;
  name: string;
  quantity: string;
}

export interface Appointment {
  id: string;
  title: string;
  type: string;
  date: string;
}

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  type: "vet" | "farrier" | "dentistry" | "injury";
}
