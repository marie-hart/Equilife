/** Règles : min 8 caractères, au moins une majuscule, un caractère spécial. */
export function validatePasswordPolicy(password: string): string | null {
    if (password.length < 8) {
        return "Le mot de passe doit contenir au moins 8 caractères";
    }
    if (!/[A-Z]/.test(password)) {
        return "Le mot de passe doit contenir au moins une majuscule";
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
        return "Le mot de passe doit contenir au moins un caractère spécial";
    }
    return null;
}
