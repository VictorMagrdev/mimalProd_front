<script setup lang="ts">
import { reactive, ref, computed } from "vue"
import { z } from "zod"
import type { FormSubmitEvent } from "@nuxt/ui"

const emit = defineEmits<{ (e: "creado"): void }>()
const toast = useToast()
const open = ref(false)

const ProductosOptionsQuery = gql`
  query ProductosOptions {
    productos {
      value: id
      label: nombre
    }
  }
`

const UnidadesOptionsQuery = gql`
  query UnidadesOptions {
    unidades {
      value: id
      label: nombre
    }
  }
`

type ProductoOption = { value: string; label: string }
type UnidadOption = { value: string; label: string }

type ProductosResult = { productos: ProductoOption[] }
type UnidadesResult = { unidades: UnidadOption[] }

const { result: productosResult } = useQuery<ProductosResult>(ProductosOptionsQuery)
const { result: unidadesResult } = useQuery<UnidadesResult>(UnidadesOptionsQuery)

const productosOptions = computed(() => productosResult.value?.productos ?? [])
const unidadesOptions = computed(() => unidadesResult.value?.unidades ?? [])

const EstructuraSchema = z.object({
  productoPadreId: z.string().min(1),
  productoHijoId: z.string().min(1),
  cantidad: z.number().positive(),
  unidadId: z.string().optional(),
  version: z.string().optional(),
  activo: z.boolean().default(true),
})
type EstructuraInput = z.infer<typeof EstructuraSchema>

const state = reactive<EstructuraInput>({
  productoPadreId: "",
  productoHijoId: "",
  cantidad: 1,
  unidadId: "",
  version: "",
  activo: true,
})

const CreateEstructuraMutation = gql`
  mutation createEstructura($input: EstructuraProductoInput!) {
    createEstructura(input: $input) {
      id
    }
  }
`

type CreateEstructuraResult = { createEstructura: { id: string } }
type CreateEstructuraVars = { input: EstructuraInput }

const { mutate } = useMutation<CreateEstructuraResult, CreateEstructuraVars>(
  CreateEstructuraMutation,
)

function resetForm() {
  state.productoPadreId = ""
  state.productoHijoId = ""
  state.cantidad = 1
  state.unidadId = ""
  state.version = ""
  state.activo = true
}

async function onSubmit(event: FormSubmitEvent<EstructuraInput>) {
  try {
    await mutate({ input: event.data })
    toast.add({ title: "Estructura creada", color: "success" })
    emit("creado")
    resetForm()
    open.value = false
  } catch (e) {
    toast.add({ title: "Error", description: String(e), color: "error" })
  }
}
</script>

<template>
  <UModal v-model:open="open" title="Nueva estructura de producto">
    <UButton label="Agregar estructura" color="neutral" variant="subtle" />

    <template #body>
      <UForm
        id="form-estructura"
        :schema="EstructuraSchema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField label="Producto Padre" name="productoPadreId">
          <UInputMenu
            v-model="state.productoPadreId"
            :items="productosOptions"
            placeholder="Selecciona producto padre"
          />
        </UFormField>

        <UFormField label="Producto Hijo" name="productoHijoId">
          <UInputMenu
            v-model="state.productoHijoId"
            :items="productosOptions"
            placeholder="Selecciona producto hijo"
          />
        </UFormField>

        <UFormField label="Cantidad" name="cantidad">
          <UInput v-model.number="state.cantidad" type="number" placeholder="Cantidad" />
        </UFormField>

        <UFormField label="Unidad" name="unidadId">
          <UInputMenu
            v-model="state.unidadId"
            :items="unidadesOptions"
            placeholder="Selecciona unidad"
          />
        </UFormField>

        <UFormField label="Versión" name="version">
          <UInput v-model="state.version" placeholder="Versión" />
        </UFormField>

        <UFormField label="Activo" name="activo">
          <UToggle v-model="state.activo" />
        </UFormField>
      </UForm>
    </template>

    <template #footer="{ close }">
      <UButton
        label="Cancelar"
        color="neutral"
        variant="outline"
        @click="
          () => {
            close()
            resetForm()
          }
        "
      />
      <UButton
        label="Crear estructura"
        type="submit"
        form="form-estructura"
        color="neutral"
      />
    </template>
  </UModal>
</template>
