<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold">{{ title }}</h3>
        <div class="flex gap-2">
          <UButton
            :loading="isLoading"
            icon="i-heroicons-document-arrow-down"
            color="primary"
            @click="$emit('export-pdf')"
          >
            PDF
          </UButton>
          <UButton
            :loading="isLoading"
            icon="i-heroicons-document-arrow-down"
            color="green"
            @click="$emit('export-csv')"
          >
            CSV
          </UButton>
        </div>
      </div>
    </template>

    <div class="flex flex-wrap items-center gap-4">
      <UFormField label="Valor faltante:" class="w-48">
        <USelect
          :model-value="fallbackValue"
          :options="fallbackOptions"
          @update:model-value="$emit('update:fallbackValue', $event)"
        />
      </UFormField>

      <UFormField>
        <UCheckbox
          :model-value="interpolation"
          label="Interpolar"
          @update:model-value="$emit('update:interpolation', $event)"
        />
      </UFormField>

      <UFormField>
        <UCheckbox
          label="Mostrar puntos"
          :model-value="showScatter"
          @update:model-value="$emit('update:showScatter', $event)"
        />
      </UFormField>

      <slot name="additional-controls" />
    </div>
  </UCard>
</template>

<script setup lang="ts">
interface Props {
  title: string;
  fallbacks: (number | null | undefined)[];
  fallbackValue: number | null | undefined;
  interpolation: boolean;
  showScatter: boolean;
  isLoading?: boolean;
}

const props = defineProps<Props>();

defineEmits<{
  "update:fallbackValue": [value: number | null | undefined];
  "update:interpolation": [value: boolean];
  "update:showScatter": [value: boolean];
  "export-pdf": [];
  "export-csv": [];
}>();

const fallbackOptions = computed(() =>
  props.fallbacks.map((option) => ({
    label: String(option),
    value: option,
  })),
);
</script>
