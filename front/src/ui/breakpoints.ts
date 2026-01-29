export const UI_BREAKPOINTS = {
    desktopMin: 1025,
    tabletMin: 768,
    xsMax: 419,
} as const;

export const VUETIFY_THRESHOLDS = {
    xs: 0,
    sm: UI_BREAKPOINTS.xsMax + 1,
    md: UI_BREAKPOINTS.tabletMin,
    lg: UI_BREAKPOINTS.desktopMin,
    xl: 1440,
    xxl: 1920,
} as const;
