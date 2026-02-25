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
        | "HealthView"
        | "HorseActivities"
        // | "HorseDocuments"
        | "FeedingView"
        | "Products"
        | "Horses";
    icon: string;
};
