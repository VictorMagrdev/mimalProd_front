<script setup lang="ts">
import { watch, computed, shallowRef } from "vue";
import {
  CalendarDate,
  Time,
  CalendarDateTime,
  fromDate,
} from "@internationalized/date";

const props = defineProps({
  modelValue: {
    type: String,
    default: null,
  },
});
const emit = defineEmits(["update:modelValue"]);

const inputDateRef = useTemplateRef("inputDateRef");

// Inicializa con la fecha y hora actuales
const now = new Date();
const zoned = fromDate(now, "UTC");

const date = shallowRef<CalendarDate>(
  new CalendarDate(zoned.year, zoned.month, zoned.day),
);
const time = shallowRef<Time>(new Time(zoned.hour, zoned.minute, zoned.second));

// Si viene valor inicial del backend, parsearlo
if (props.modelValue) {
  try {
    const js = new Date(props.modelValue);
    if (!isNaN(js.getTime())) {
      const zoned = fromDate(js, "UTC");
      date.value = new CalendarDate(zoned.year, zoned.month, zoned.day);
      time.value = new Time(zoned.hour, zoned.minute, zoned.second);
    }
  } catch (error) {
    console.warn("Error parsing initial datetime value:", error);
  }
}

// Computed que genera el formato correcto para backend: YYYY-MM-DDTHH:mm
const datetimeString = computed(() => {
  try {
    const dt = new CalendarDateTime(
      date.value.year,
      date.value.month,
      date.value.day,
      time.value.hour,
      time.value.minute,
      0,
    );
    const js = dt.toDate("UTC");
    return js.toISOString().slice(0, 16);
  } catch (error) {
    console.warn("Error generating datetime string:", error);
    return null;
  }
});

watch(
  [date, time],
  () => {
    if (datetimeString.value) {
      emit("update:modelValue", datetimeString.value);
    }
  },
  { deep: true },
);
</script>

<template>
  <UFormField>
    <div class="flex gap-2 items-center">
      <UInputDate ref="inputDateRef" v-model="date" class="flex-1">
        <template #trailing>
          <UPopover :reference="inputDateRef?.inputsRef[3]?.$el">
            <UButton
              variant="link"
              color="neutral"
              size="sm"
              icon="i-lucide-calendar"
              class="px-0"
              aria-label="Seleccionar fecha"
            />
            <template #content>
              <UCalendar v-model="date" class="p-2" />
            </template>
          </UPopover>
        </template>
      </UInputDate>

      <UInputTime v-model="time" class="flex-1" />
    </div>
  </UFormField>
</template>
