<script setup lang="ts">
import { reactive, watch, computed } from 'vue';
import { useQuery } from '#imports';
import GetProductoById from '~/graphql/productos/get-producto-by-id.graphql';
import UpdateProducto from '~/graphql/productos/update-producto.graphql';
import GetUnidadesMedida from '~/graphql/unidades-medida/get-unidades-medida.graphql';

const props = defineProps<{ 
  isOpen: boolean;
  productoId: string | null;
}>();
const emit = defineEmits(['close', 'producto-actualizado']);

const state = reactive({
  codigo: '',
  nombre: '',
  idUnidadBase: undefined as number | undefined,
  costoBase: 0,
});

// Fetch product data when ID changes
const { result: productoResult, loading: productoLoading } = useQuery(GetProductoById, { id: computed(() => props.productoId) }, { enabled: computed(() => !!props.productoId) });

watch(productoResult, (newVal) => {
  if (newVal?.producto) {
    const p = newVal.producto;
    state.codigo = p.codigo;
    state.nombre = p.nombre;
    state.costoBase = p.costoBase;
    state.idUnidadBase = p.unidadBase?.id;
  }
});

// Fetch unidades de medida for the select menu
const { data: unidadesResult, pending: unidadesLoading } = await useAsyncQuery(GetUnidadesMedida);
const unidadesOptions = computed(() => 
  unidadesResult.value?.unidadesMedida.map((u: any) => ({ label: u.nombre, value: u.id })) || []
);

const { mutate, loading: updateLoading, error } = useMutation(UpdateProducto);

const toast = useToast();

function closeModal() {
  emit('close');
}

async function onSubmit() {
  if (!props.productoId) return;
  try {
    await mutate({ id: props.productoId, input: state });
    toast.add({ title: 'Producto Actualizado', description: 'El producto ha sido actualizado exitosamente.' });
    emit('producto-actualizado');
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
        <h2>Actualizar Producto</h2>
      </template>

      <div v-if="productoLoading" class="text-center">Cargando...</div>
      <UForm v-else :state="state" class="space-y-4" @submit="onSubmit">
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
          <UButton type="submit" :loading="updateLoading">Actualizar Producto</UButton>
        </div>

        <p v-if="error" class="text-red-500 mt-2">{{ error.message }}</p>
      </UForm>
    </UCard>
  </UModal>
</template>
