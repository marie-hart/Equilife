<template>
  <div>
    <v-bottom-navigation
      v-if="showBottomNav"
      :model-value="activeTab"
      grow
      app
      @update:model-value="emit('update:activeTab', $event)"
    >
      <v-btn v-for="item in bottomNavItems" :key="item.tab" :value="item.tab" @click="go(item)">
        <font-awesome-icon :icon="item.icon" />
        <span>{{ item.label }}</span>
      </v-btn>
    </v-bottom-navigation>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDisplay } from 'vuetify'

type NavTab =
  | 'dashboard'
  | 'reminders'
  | 'health'
  | 'activities'
  | 'documents'
  | 'feeding'
  | 'products'
  | 'horses'

type NavItem = {
  tab: NavTab
  label: string
  routeName:
    | 'HorseDashboardView'
    | 'Reminders'
    | 'HorseHealth'
    | 'HorseActivities'
    | 'HorseDocuments'
    | 'HorseFeeding'
    | 'HorseProducts'
    | 'Horses'
  icon: string
}

const props = defineProps<{
  navItems: NavItem[]
  activeTab: NavTab
  isMoreOpen: boolean
}>()

const emit = defineEmits<{
  (event: 'navigate', routeName: NavItem['routeName']): void
  (event: 'update:isMoreOpen', value: boolean): void
  (event: 'update:activeTab', value: NavTab): void
}>()

const { lgAndUp } = useDisplay()

const showBottomNav = computed(() => !lgAndUp.value)

const getItem = (tab: NavTab) => props.navItems.find((item) => item.tab === tab)

const bottomNavItems = computed(() => {
  const items: NavItem[] = []
  const baseTabs: NavTab[] = ['dashboard', 'products', 'documents', 'horses']
  baseTabs.forEach((tab) => {
    const item = getItem(tab)
    if (item) items.push(item)
  })
  return items
})

const go = (item: NavItem) => {
  emit('navigate', item.routeName)
}
</script>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({})
</script>
