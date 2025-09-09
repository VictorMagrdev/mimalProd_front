# Guía de Desarrollo para Gemini

Este documento sirve como guía para que Gemini entienda las convenciones, arquitectura y estándares de este proyecto. Es fundamental leer este archivo antes de realizar cualquier modificación.

## 1. Resumen del Proyecto y Stack Tecnológico

- **Framework Principal:** **Nuxt.js 3**. La estructura del proyecto (`app/`, `nuxt.config.ts`) lo confirma.
- **Lenguaje:** **TypeScript**. La prevalencia de archivos `.ts` indica que es el lenguaje principal y se debe usar tipado estricto.
- **Gestor de Paquetes:** **pnpm**. La presencia de `pnpm-lock.yaml` y `pnpm-workspace.yaml` indica que las dependencias se gestionan con `pnpm`.
- **Propósito de la Aplicación:** Parece ser un panel de administración (dashboard) para la gestión de Usuarios, Roles y Políticas, dada la estructura de las páginas y componentes.
- **Control de Versiones:** **Git**. El proyecto está versionado con Git.

## 2. Estructura y Arquitectura del Proyecto

La aplicación sigue la estructura estándar de Nuxt 3.

- `app/`: Contiene el código fuente principal.
  - `assets/`: Para recursos estáticos como CSS (`main.css`) e imágenes.
  - `components/`: Componentes de Vue reutilizables.
  - `composables/`: Para funciones "composables" de Vue/Nuxt.
  - `layouts/`: Plantillas de página (ej. `default.vue`).
  - `middleware/`: Contiene el middleware de rutas. `auth.global.ts` es especialmente importante.
  - `pages/`: Define la estructura de rutas de la aplicación de forma automática.
  - `stores/`: Para los almacenes de estado de **Pinia** (inferido por ser el estándar en Nuxt 3 y la presencia de `stores/auth.ts`).
- `cypress/`: Contiene las pruebas End-to-End (E2E) con **Cypress**.
- `public/`: Para archivos estáticos que se sirven directamente desde la raíz del servidor.
- `eslint.config.mjs`: Configuración de **ESLint** para el linting de código.
- `nuxt.config.ts`: Archivo de configuración principal de Nuxt.

## 3. Convenciones y Estándares de Código

### 3.1. Lenguaje y Estilo
- **TypeScript:** Utilizar siempre tipado estricto. Evitar el uso de `any` a menos que sea estrictamente necesario.
- **Estilo de Código:** Las reglas están definidas en `eslint.config.mjs`. **Es obligatorio seguir estas reglas**. Antes de finalizar una tarea, se debe ejecutar un linter para validar el código.
- **Nomenclatura de Archivos:** Usar `kebab-case` para la mayoría de los archivos, excepto para los componentes de Vue.

### 3.2. Componentes de Vue (`.vue`)
- **Nomenclatura:** Usar **PascalCase** para los nombres de archivo y componentes (ej. `UpdateUser.vue`, `NewPolicy.vue`).
- **Ubicación:** Deben crearse en `app/components/`.
- **Especificidad:** Los componentes actuales están orientados a acciones y entidades específicas (CRUD), como `NewUser.vue` o `DeleteRoleUser.vue`. Este patrón debe mantenerse.
- **Estructura Interna:** Se prefiere el siguiente orden dentro de un archivo `.vue`:
  1.  `<script setup lang="ts">`
  2.  `<template>`
  3.  `<style scoped>`
- **Estilos:** Usar `scoped` en los estilos para evitar colisiones de CSS.

### 3.3. Gestión de Estado (Pinia)
- **Ubicación:** `app/stores/`.
- **Estructura:** La gestión de estado es modular. Cada módulo de estado (store) debe tener su propio archivo (ej. `auth.ts`, `users.ts`).

### 3.4. Rutas y Páginas
- **Sistema de Rutas:** Se utiliza el sistema basado en archivos de Nuxt. La estructura de la carpeta `app/pages/` define las URLs.
- **Rutas Dinámicas:** Se crean usando corchetes en el nombre del directorio o archivo (ej. `app/pages/usuarios/[id]/index.vue`).

### 3.5. Autenticación y Middleware
- **Mecanismo Central:** La autenticación es manejada por el middleware global `app/middleware/auth.global.ts`.
- **Lógica:** Este middleware se ejecuta en cada cambio de ruta. Probablemente revisa un token (almacenado en el store `auth.ts` de Pinia o en cookies) y redirige a `/login` si el usuario no está autenticado. Cualquier nueva ruta protegida debe respetar esta lógica.

### 3.6. Patrón de Implementación de CRUD

El análisis de los componentes existentes revela un patrón claro para las operaciones CRUD. Es obligatorio seguir este patrón.

- **1. Componentes Modales Autónomos:**
  - Cada operación (Crear, Actualizar, Borrar, Asignar relación) debe encapsularse en su propio componente Vue.
  - Estos componentes utilizan el componente `<UModal>` de Nuxt UI para presentarse como una ventana modal.
  - El modal se activa/desactiva desde una vista principal (generalmente una tabla) a través de una prop `open` y emite un evento `close` para cerrarse.

- **2. Flujo de Datos y API (GraphQL):**
  - **Archivos `.graphql`:** Las operaciones de GraphQL (queries, mutaciones) deben definirse en archivos `.graphql` individuales dentro de una carpeta con el nombre de la entidad (ej. `app/graphql/productos/get-productos.graphql`). No se deben escribir `gql` strings directamente en los archivos de TypeScript.
  - **Uso de Composables de Apollo:** Se deben utilizar los composables de `@vue/apollo-composable` (`useQuery`, `useMutation`) para interactuar con la API de GraphQL.
  - **Autenticación:** El plugin de Apollo (`app/plugins/apollo.ts`) ya está configurado para inyectar el token de autenticación en cada petición.

- **3. Manejo de Estado y Formularios:**
  - **Estado Local:** El estado del formulario dentro de un componente modal se gestiona con `reactive()`.
  - **Función `resetForm()`:** Cada componente debe tener una función `resetForm()` que restaure el estado inicial del formulario. Esta función se llama después de un envío exitoso o al cancelar.
  - **Carga de Datos Auxiliares:** Si un formulario necesita datos adicionales (ej. una lista de `UnidadMedida`), estos se deben cargar con `useQuery` cuando el modal se abre.

- **4. Comunicación entre Componentes (Event-driven):**
  - **Emisión de Eventos:** Tras una operación exitosa (crear, actualizar), el componente modal debe emitir un evento descriptivo al componente padre (ej: `@producto-creado`, `@producto-actualizado`).
  - **Refresco de Datos:** El componente padre (la página con la tabla) debe escuchar estos eventos y usar el método `refetch()` devuelto por `useQuery` para recargar los datos y reflejar los cambios en la UI.

- **5. Feedback al Usuario:**
  - **Notificaciones:** Se debe usar `useToast()` para mostrar un mensaje de éxito o error después de cada operación.
  - **Manejo de Errores:** El objeto `error` devuelto por `useQuery` y `useMutation` debe usarse para mostrar notificaciones de error claras.

## 4. Pruebas (Testing)

- **Framework:** **Cypress** para pruebas E2E.
- **Ubicación de Tests:** `cypress/e2e/`.
- **Nomenclatura:** Los archivos de test deben seguir el patrón `[feature-name].cy.ts` (ej. `users.cy.ts`, `roles.cy.ts`).
- **Requisito:** Al añadir o modificar una funcionalidad significativa en el frontend, se debe crear o actualizar el archivo de test E2E correspondiente para cubrir el nuevo caso de uso.

## 5. Control de Versiones (Git)

- **Mensajes de Commit:** Aunque no crearé commits, si se me pide sugerir un mensaje, debe seguir el estándar de **[Conventional Commits](https://www.conventionalcommits.org/)**.
  - **Ejemplos:**
    - `feat: agregar formulario de creación de roles`
    - `fix: corregir redirección después del login`
    - `docs: actualizar guía de desarrollo GUIA_GEMINI.md`
    - `refactor: migrar componente de usuario a Composition API`
- **Flujo de Trabajo:** **No debo ejecutar `git add` ni `git commit`**. Mi tarea termina al generar o modificar el código. El usuario se encargará de revisar los cambios y crear los commits manualmente para garantizar la calidad.
