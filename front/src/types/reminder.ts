import { RecurrenceUnit } from "./ui";

export type ReminderType =
    | "all"
    | "soin"
    | "activité"
    | "alimentation"
    | "autres";


export interface ReminderFormValue {
    id?: string;
    horseIds: string[];
    description: string;
    date: string;
    reminderType: "soin" | "activité" | "alimentation" | "autres";
    isRecurring: boolean;
    recurrenceInterval: number;
    recurrenceUnit: RecurrenceUnit;
}
