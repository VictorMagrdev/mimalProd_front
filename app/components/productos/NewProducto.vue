<script setup lang="ts">
import { reactive, computed } from 'vue';
import CreateProducto from '~/graphql/productos/create-producto.graphql';
import GetUnidadesMedida from '~/graphql/unidades-medida/get-unidades-medida.graphql'; // Assuming this query exists

const props = defineProps<{ isOpen: boolean }>();
const emit = defineEmits(['close', 'producto-creado']);

const initialState = {
  codigo: '',
  nombre: '',
  idUnidadBase: undefined as number | undefined,
  costoBase: 0,
};

const state = reactive({ ...initialState });

// Fetch unidades de medida for the select menu
const { data: unidadesResult, pending: unidadesLoading } = await useAsyncQuery(GetUnidadesMedida);
const unidadesOptions = computed(() => 
  unidadesResult.value?.unidadesMedida.map((u: any) => ({ label: u.nombre, value: u.id })) || []
);

const { mutate, loading, error } = useMutation(CreateProducto);

const toast = useToast();

function resetForm() {
  Object.assign(state, initialState);
}

function closeModal() {
  resetForm();
  emit('close');
}

async function onSubmit() {
  try {
    await mutate({ input: state });
    toast.add({ title: 'Producto Creado', description: 'El producto ha sido creado exitosamente.' });
    emit('producto-creado');
    closeModal();
  } catch (e: any) {
    toast.add({ title: 'Error', description: e.message });
  }
}

</script>

<template>
  <UModal :model-value="props.isOpen" @update:model-value="closeModal">
    <UCard>
      <template #header>
        <h2>Crear Nuevo Producto</h2>
      </template>

      <UForm :state="state" class="space-y-4" @submit="onSubmit">
        <UFormGroup label="Código" name="codigo">
          <UInput v-model="state.codigo" />
        </UFormGroup>

        <UFormGroup label="Nombre" name="nombre">
          <UInput v-model="state.nombre" />
        </UFormGroup>

        <UFormGroup label="Costo Base" name="costoBase">
          <UInput v-model.number="state.costoBase" type="number" />
        </UFormGroup>

        <UFormGroup label="Unidad Base" name="idUnidadBase">
          <USelectMenu 
            v-model="state.idUnidadBase"
            :options="unidadesOptions"
            value-attribute="value"
            option-attribute="label"
            placeholder="Seleccione una unidad"
            :loading="unidadesLoading"
          />
        </UFormGroup>

        <div class="flex justify-end space-x-2">
          <UButton  variant="ghost" @click="closeModal">Cancelar</UButton>
          <UButton type="submit" :loading="loading">Crear Producto</UButton>
        </div>

        <p v-if="error" class="text-red-500 mt-2">{{ error.message }}</p>
      </UForm>
    </UCard>
  </UModal>
</template>
