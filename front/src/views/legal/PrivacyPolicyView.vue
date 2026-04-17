<template>
  <v-sheet color="#EDE4D8" min-height="100vh" class="py-6">
    <v-container class="px-4">
      <v-card rounded="xl" class="pa-5 shadow-subtle border-light">
        <h1 class="text-h5 font-weight-bold mb-4" style="color: #2E4B36">Politique de confidentialité</h1>

        <h2 class="text-subtitle-1 font-weight-bold mb-2" style="color: #554338">Données collectées</h2>
        <p class="text-body-2 mb-4" style="color: #554338">
          Nous collectons les données nécessaires au fonctionnement de l'application (compte, chevaux, soins, produits, pièces jointes).
        </p>

        <h2 class="text-subtitle-1 font-weight-bold mb-2" style="color: #554338">Finalités</h2>
        <p class="text-body-2 mb-4" style="color: #554338">
          Ces données sont utilisées pour fournir le service, améliorer l'expérience utilisateur et sécuriser la plateforme.
        </p>

        <h2 class="text-subtitle-1 font-weight-bold mb-2" style="color: #554338">Base légale et conservation</h2>
        <p class="text-body-2 mb-4" style="color: #554338">
          [A compléter: base légale RGPD et durées de conservation par catégorie de données].
        </p>

        <h2 class="text-subtitle-1 font-weight-bold mb-2" style="color: #554338">Vos droits</h2>
        <p class="text-body-2 mb-0" style="color: #554338">
          Vous disposez d'un droit d'accès, de rectification, d'effacement, d'opposition et de portabilité. Contact: [A compléter: email RGPD].
        </p>
      </v-card>
    </v-container>
  </v-sheet>
</template>

<style scoped>
.shadow-subtle {
  box-shadow: 0 4px 15px rgba(123, 91, 62, 0.05) !important;
}
.border-light {
  border: 1px solid rgba(168, 159, 148, 0.2) !important;
}
</style>
