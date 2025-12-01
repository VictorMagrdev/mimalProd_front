<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { Row } from "@tanstack/vue-table";
import { gql } from "graphql-tag";
import { computed, h, ref, resolveComponent } from "vue";

const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");
const UBadge = resolveComponent("UBadge");

const GetIncidencias = gql`
  query GetIncidencias {
    incidencias {
      id
      codigo
      titulo
      descripcion
      tipoIncidencia {
        id
        nombre
      }
      estado {
        id
        nombre
      }
      maquina {
        id
        nombre
      }
      orden {
        id
        numeroOrden
      }
      estacion {
        id
        nombre
      }
      fechaCierre
      tiempoParada
      creadoEn
      archivos {
        id
        tipo
        nombreOriginal
        url
      }
    }
  }
`;

export interface IncidenciaArchivo {
  id: string;
  tipo: string;
  nombreOriginal: string;
  url: string;
}

export interface Incidencia {
  id: string;
  codigo: string;
  titulo: string;
  descripcion?: string;
  tipoIncidencia?: { id: string; nombre: string };
  estado?: { id: string; nombre: string };
  maquina?: { id: string; nombre: string };
  orden?: { id: string; numeroOrden: string };
  estacion?: { id: string; nombre: string };
  fechaCierre?: string;
  tiempoParada?: string;
  creadoEn: string;
  archivos: IncidenciaArchivo[];
}

interface IncidenciaResult {
  incidencias: Incidencia[];
}

const { data, pending, error, execute } =
  await useAsyncQuery<IncidenciaResult>(GetIncidencias);

const incidencias = computed(() => data.value?.incidencias || []);

const columns: TableColumn<Incidencia>[] = [
  {
    accessorKey: "codigo",
    header: "Código",
    cell: ({ row }: { row: Row<Incidencia> }) =>
      h("span", { class: "font-mono" }, row.original.codigo),
  },
  {
    accessorKey: "titulo",
    header: "Título",
  },
  {
    accessorKey: "tipoIncidencia.nombre",
    header: "Tipo",
    cell: ({ row }) => row.original.tipoIncidencia?.nombre ?? "-",
  },
  {
    accessorKey: "estado.nombre",
    header: "Estado",
    cell: ({ row }) => {
      const estado = row.original.estado?.nombre;
      const color =
        estado === "Resuelta"
          ? "success"
          : estado === "En Progreso"
            ? "warning"
            : "neutral";
      return h(
        UBadge,
        {
          class: "capitalize",
          variant: "subtle",
          color,
        },
        () => estado || "-",
      );
    },
  },
  {
    accessorKey: "maquina.nombre",
    header: "Máquina",
    cell: ({ row }) => row.original.maquina?.nombre ?? "-",
  },
  {
    accessorKey: "creadoEn",
    header: "Creado",
    cell: ({ row }) => new Date(row.original.creadoEn).toLocaleString(),
  },
  {
    accessorKey: "archivos",
    header: "Archivos",
    cell: ({ row }) => {
      const archivos = row.original.archivos || [];
      const fotos = archivos.filter((a) => a.tipo === "FOTO").length;
      const audios = archivos.filter((a) => a.tipo === "AUDIO").length;

      return h("div", { class: "flex gap-2 text-sm" }, [
        fotos > 0
          ? h(
              UBadge,
              {
                color: "blue",
                variant: "subtle",
                size: "sm",
              },
              () => `${fotos} 📷`,
            )
          : null,
        audios > 0
          ? h(
              UBadge,
              {
                color: "green",
                variant: "subtle",
                size: "sm",
              },
              () => `${audios} 🎵`,
            )
          : null,
      ]);
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) =>
      h(
        "div",
        { class: "text-right" },
        h(
          UDropdownMenu,
          {
            items: getRowItems(row.original),
            content: { align: "end" },
          },
          () =>
            h(UButton, {
              icon: "i-lucide-ellipsis-vertical",
              color: "neutral",
              variant: "ghost",
              "aria-label": "Acciones",
            }),
        ),
      ),
  },
];

function getRowItems(incidencia: Incidencia) {
  return [
    [
      {
        label: "Ver Detalles",
        icon: "i-heroicons-eye-20-solid",
        onSelect: () => openDetailsModal(incidencia.id),
      },
    ],
    [
      {
        label: "Descargar Archivos",
        icon: "i-heroicons-arrow-down-tray-20-solid",
        onSelect: () => downloadArchivos(incidencia),
      },
    ],
  ];
}

function openDetailsModal(id: string) {
  navigateTo(`/incidentes/${id}`);
}

function downloadArchivos(incidencia: Incidencia) {
  incidencia.archivos.forEach((archivo) => {
    const link = document.createElement("a");
    link.href = archivo.url;
    link.download = archivo.nombreOriginal;
    link.click();
  });
}

const table = useTemplateRef("table");
const pagination = ref({ pageIndex: 0, pageSize: 10 });
const globalFilter = ref("");
</script>

<template>
  <div class="w-full space-y-4 pb-4">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold pl-8 pt-4">Incidencias</h1>
    </div>

    <div
      class="flex justify-between items-center px-4 py-3.5 border-b border-accented"
    >
      <UInput
        v-model="globalFilter"
        class="max-w-sm"
        placeholder="Filtrar incidencias..."
      />

      <div class="flex items-center space-x-2">
        <UDropdownMenu
          :items="
            table?.tableApi
              ?.getAllColumns()
              .filter((column: any) => column.getCanHide())
              .map((column: any) => ({
                label: column.id,
                type: 'checkbox' as const,
                checked: column.getIsVisible(),
                onUpdateChecked(checked: boolean) {
                  table?.tableApi
                    ?.getColumn(column.id)
                    ?.toggleVisibility(checked);
                },
                onSelect(e?: Event) {
                  e?.preventDefault();
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
        <IncidenciasNewIncidencia @creada="execute()" />
      </div>
    </div>
    <UTable
      ref="table"
      v-model:pagination="pagination"
      v-model:global-filter="globalFilter"
      :data="incidencias"
      :columns="columns"
      :loading="pending"
      sticky
      class="flex-1 overflow-auto h-96"
    />

    <div v-if="error" class="text-red-600">Error: {{ error.message }}</div>
  </div>
</template>
