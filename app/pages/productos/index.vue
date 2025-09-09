<script setup lang="ts">
import { ref, computed } from "vue";
import type { Producto } from "~/graphql/types";
import getProductos from "~/graphql/productos/get-productos.graphql";

definePageMeta({
  middleware: "auth",
});

const { result, loading, error, refetch } = useQuery(getProductos);

const productos = computed(() => result.value?.productos ?? []);

const columns = [
  { key: "codigo", label: "Código" },
  { key: "nombre", label: "Nombre" },
  { key: "costoBase", label: "Costo Base" },
  { key: "unidadBase.nombre", label: "Unidad Base" },
  { key: "actions", label: "Acciones" },
];

const isNewOpen = ref(false);
const isUpdateOpen = ref(false);
const selectedProductoId = ref<string | null>(null);

function openUpdateModal(id: string) {
  selectedProductoId.value = id;
  isUpdateOpen.value = true;
}

function handleProductoCreated() {
  isNewOpen.value = false;
  refetch();
}

function handleProductoUpdated() {
  isUpdateOpen.value = false;
  refetch();
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">Productos</h1>

    <UButton label="Nuevo Producto" @click="isNewOpen = true" class="mb-4" />

    <div v-if="loading">Cargando...</div>
    <div v-if="error" class="text-red-500">{{ error.message }}</div>

    <UTable v-if="!loading && !error" :rows="productos" :columns="columns">
      <template #actions-data="{ row }">
        <UButton
          icon="i-heroicons-pencil"
          size="sm"
          color="primary"
          variant="ghost"
          @click="openUpdateModal(row.id)"
        />
      </template>
    </UTable>

    <ProductosNewProducto
      v-model:open="isNewOpen"
      @producto-creado="handleProductoCreated"
    />

    <ProductosUpdateProducto
      v-if="selectedProductoId"
      v-model:open="isUpdateOpen"
      :producto-id="selectedProductoId"
      @producto-actualizado="handleProductoUpdated"
    />
  </div>
</template>
