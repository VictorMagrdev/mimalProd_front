<script setup lang="ts">
    import * as z from 'zod'
    import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
  layout: false,
});

const authStore = useAuthStore()
const router = useRouter()

const schema = z.object({
  username: z.string('Invalid username'),
  password: z.string().min(8, 'Must be at least 8 characters')
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  username: undefined,
  password: undefined
})
const error = ref('')
const toast = useToast()
async function onSubmit(event: FormSubmitEvent<Schema>) {
    error.value = ''
    try {
    const result = await authStore.login(
      event.data.username,
      event.data.password
    )

    if (result) {
      router.push('/')
    } else {
      error.value = 'Invalid credentials'
    }
  } catch (err) {
    error.value = (err instanceof Error && err.message) ? err.message : 'An error occurred'
  }
  toast.add(
    { 
        title: 'Success', 
        description: 'The form has been submitted.', 
        color: 'success' 
    }
)
}
</script>

<template>
  <div class="flex items-center justify-center min-h-screen p-4">
    <UCard class="w-72 max-w-md">
      <template #header>
          <h1 class="text-2xl font-bold text-center">Login Page</h1>
      </template>

      <UForm id="loginForm" :schema="schema" :state="state" class="space-y-6" @submit="onSubmit">
        <UFormField label="Username" name="username">
          <UInput v-model="state.username" class="w-full" size="lg" />
        </UFormField>

        <UFormField label="Password" name="password">
          <UInput v-model="state.password" type="password" class="w-full" size="lg" />
        </UFormField>

        <div v-if="error" class="p-3 rounded-lg">
          {{ error }}
        </div>
      </UForm>

      <template #footer>
        <div class="flex justify-center mt-2">
          <UButton form="loginForm" type="submit" size="lg" class="px-8">
            Submit
          </UButton>
        </div>
      </template>
    </UCard>
  </div>
</template>