export type NavTab =
    | "dashboard"
    | "reminders"
    | "health"
    | "activities"
    // | "documents"
    | "feeding"
    | "products"
    | "horses";

export type NavItem = {
    tab: NavTab;
    label: string;
    routeName:
        | "HorseDashboardView"
        | "Reminders"
        | "HorseHealth"
        | "HorseActivities"
        // | "HorseDocuments"
        | "HorseFeeding"
        | "HorseProducts"
        | "Horses";
    icon: string;
};
