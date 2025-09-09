<script setup lang="ts">
import { ref, h } from "vue";
import type { TableColumn } from "@nuxt/ui";
import GetProductos from '~/graphql/productos/get-productos.graphql';

// This requires a GraphQL client setup, which we've done in plugins/apollo.ts
// and a way to import .graphql files, which might require a vite plugin if not default.
const { data, pending, error, refresh: refetch } = await useAsyncQuery(GetProductos);

const productos = computed(() => data.value?.productos || []);

export interface ProductoUI {
  id: string;
  codigo: string;
  nombre: string;
  costoBase: number;
  unidadBase: {
    nombre: string;
  };
}

const columns: TableColumn<ProductoUI>[] = [
  {
    accessorKey: "codigo",
    header: "Código",
  },
  {
    accessorKey: "nombre",
    header: "Nombre",
  },
  {
    accessorKey: "costoBase",
    header: "Costo Base",
  },
  {
    accessorKey: "unidadBase.nombre",
    header: "Unidad",
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => h("div", { class: "text-right" }, [
      h("button", { onClick: () => console.log('Update', row.original.id) }, "Actualizar")
    ]),
  },
];

const pagination = ref({ pageIndex: 1, pageSize: 10 });
const globalFilter = ref();

const isNewProductoModalOpen = ref(false);

</script>

<template>
  <div class="w-full space-y-4 pb-4">
    <h1>Vista de Productos</h1>

    <div class="flex items-center justify-between border-b border-accented px-4 py-3.5">
      <UInput
        v-model="globalFilter"
        class="max-w-sm"
        placeholder="Filtrar..."
      />

      <div class="flex items-center space-x-2">
        <UButton label="Nuevo Producto" color="neutral" variant="subtle" @click="isNewProductoModalOpen = true" />
      </div>
    </div>

    <div class="relative z-0 w-full">
      <UTable
        v-model:pagination="pagination"
        v-model:global-filter="globalFilter"
        :rows="productos"
        :columns="columns"
        :loading="pending"
      />
      <div class="sticky bottom-8 z-10 mt-4 w-full bg-white">
        <UPagination
          v-model="pagination.pageIndex"
          :page-count="pagination.pageSize"
          :total="productos?.length || 0"
        />
      </div>
    </div>

    <div v-if="error" class="text-red-600">Error: {{ error.message }}</div>

    <!-- New Producto Modal -->
    <ProductosNewProducto 
      :is-open="isNewProductoModalOpen" 
      @close="isNewProductoModalOpen = false" 
      @producto-creado="refetch"
    />

    <!-- <UpdateProducto :product-id="selectedId" @updated="refetch()" /> -->

  </div>
</template>
