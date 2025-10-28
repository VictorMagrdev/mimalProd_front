<script setup lang="ts">
import { ref, h, computed, resolveComponent } from "vue"
import type { TableColumn } from "@nuxt/ui"
import NewEstructuraProducto from "~/components/estructura-producto/NewEstructuraProducto.vue"

const UBadge = resolveComponent("UBadge")

export interface Estructura {
  id: string
  productoPadreNombre: string
  productoHijoNombre: string
  cantidad: number
  unidadNombre?: string
  version?: string
  activo: boolean
  creadoEn: string
}

interface QueryResult {
  getAllEstructuras: Estructura[]
}

const query = gql`
  query getAllEstructuras {
    getAllEstructuras {
      id
      productoPadreNombre
      productoHijoNombre
      cantidad
      unidadNombre
      version
      activo
      creadoEn
    }
  }
`

const { data, pending, error, execute } = await useAsyncQuery<QueryResult>(query)
const estructuras = computed(() => data.value?.getAllEstructuras ?? [])

const columns: TableColumn<Estructura>[] = [
  { accessorKey: "productoPadreNombre", header: "Padre" },
  { accessorKey: "productoHijoNombre", header: "Hijo" },
  {
    accessorKey: "cantidad",
    header: "Cantidad",
    cell: ({ row }) =>
      h("div", { class: "text-sm font-mono" }, row.original.cantidad.toString()),
  },
  {
    accessorKey: "unidadNombre",
    header: "Unidad",
    cell: ({ row }) =>
      row.original.unidadNombre ||
      h("span", { class: "italic text-muted" }, "N/A"),
  },
  {
    accessorKey: "version",
    header: "Versión",
    cell: ({ row }) =>
      row.original.version || h("span", { class: "text-muted italic" }, "N/A"),
  },
  {
    accessorKey: "activo",
    header: "Activo",
    cell: ({ row }) =>
      h(
        UBadge,
        {
          variant: "subtle",
          color: row.original.activo ? "success" : "neutral",
        },
        () => (row.original.activo ? "Sí" : "No"),
      ),
  },
  {
    accessorKey: "creadoEn",
    header: "Creado",
    cell: ({ row }) =>
      h(
        "div",
        { class: "text-sm text-muted" },
        new Date(row.original.creadoEn).toLocaleDateString("es-ES"),
      ),
  },
]

const table = useTemplateRef("table")
const pagination = ref({ pageIndex: 0, pageSize: 10 })
const globalFilter = ref("")
</script>

<template>
  <div class="w-full space-y-4 pb-4">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Estructuras de Producto</h1>
      <NewEstructuraProducto @creado="execute" />
    </div>

    <div class="flex items-center gap-2 px-4 py-3.5 border-b border-accented overflow-x-auto">
      <UInput
        v-model="globalFilter"
        class="max-w-sm min-w-[12ch]"
        placeholder="Filtrar estructuras..."
        @update:model-value="table?.tableApi?.setGlobalFilter($event)"
      />

      <UDropdownMenu
        :items="
          table?.tableApi
            ?.getAllColumns()
            .filter((column: any) => column.getCanHide())
            .map((column: any) => ({
              label: column.columnDef.header,
              type: 'checkbox' as const,
              checked: column.getIsVisible(),
              onUpdateChecked(checked: boolean) {
                table?.tableApi?.getColumn(column.id)?.toggleVisibility(!!checked)
              },
              onSelect(e?: Event) {
                e?.preventDefault()
              },
            }))
        "
        :content="{ align: 'end' }"
      >
        <UButton
          label="Columnas"
          color="neutral"
          variant="outline"
          trailing-icon="i-lucide-chevron-down"
        />
      </UDropdownMenu>
    </div>

    <UTable
      ref="table"
      v-model:pagination="pagination"
      v-model:global-filter="globalFilter"
      :data="estructuras"
      :columns="columns"
      :loading="pending"
      class="flex-1"
    />

    <div class="px-4 py-3.5 border-t border-accented text-sm text-muted">
      Mostrando {{ table?.tableApi?.getRowModel().rows.length || 0 }} de
      {{ estructuras.length }} estructuras
    </div>

    <div v-if="error" class="text-red-600 bg-red-50 p-4 rounded-lg">
      Error al cargar estructuras: {{ error.message }}
    </div>
  </div>
</template>
