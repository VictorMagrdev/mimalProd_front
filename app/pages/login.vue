<script setup  lang="ts">
    import * as z from 'zod'
    import type { FormSubmitEvent } from '@nuxt/ui'

const authStore = useAuthStore()
const router = useRouter()

const schema = z.object({
  email: z.email('Invalid email'),
  password: z.string().min(8, 'Must be at least 8 characters')
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  email: undefined,
  password: undefined
})
const error = ref('')
const toast = useToast()
async function onSubmit(event: FormSubmitEvent<Schema>) {
    error.value = ''
    try {
    const result = await authStore.login(
      event.data.email,
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
  <UCard>
    <template #header>
        <h1>Login Page</h1>
    </template>

   <UForm id="loginForm" :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
    <UFormField label="Email" name="email">
      <UInput v-model="state.email" />
    </UFormField>

    <UFormField label="Password" name="password">
      <UInput v-model="state.password" type="password" />
    </UFormField>

    
  </UForm>

    <template #footer>
        <UButton form="loginForm" type="submit">
      Submit
    </UButton>

    </template>
  </UCard>
</template>

