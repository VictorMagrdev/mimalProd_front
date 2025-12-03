# Análisis del Proyecto: Sistema de Gestión de Producción

Este documento detalla el análisis y la planificación del proyecto, basado en la estructura de los repositorios `minimalProd` (frontend) y `minimal-prod-backend` (backend).

### 8. Arquitectura y Diseño

#### 8.1. Arquitectura General

El sistema sigue una **arquitectura cliente-servidor**:

- **Cliente (Frontend):** Una Single Page Application (SPA) desarrollada con **Nuxt.js (Vue.js)**. Se encarga de toda la interfaz de usuario y la interacción con el cliente. Al ser una SPA, la navegación es fluida y la carga inicial contiene toda la lógica necesaria para operar.
- **Servidor (Backend):** Una aplicación monolítica desarrollada con **Spring Boot 3 y Java 21**. Expone una API **GraphQL** para la comunicación con el frontend.

#### 8.2. Diseño del Backend

- **Framework:** Spring Boot 3.5.5.
- **Lenguaje:** Java 21.
- **API:** `spring-boot-starter-graphql` para implementar un endpoint GraphQL, que centraliza todas las operaciones de datos. El schema está definido en `schema-back.graphqls`.
- **Base de Datos:**
  - **Producción:** PostgreSQL. La configuración en `application.yml` apunta a una base de datos local `minimalProd`.
  - **Migraciones:** **Flyway** gestiona la evolución del esquema de la base de datos de forma versionada.
  - **Acceso a Datos:** Spring Data JPA con Hibernate.
- **Seguridad:** `spring-security` y **JWT (JSON Web Tokens)** para proteger la API.
- **Contenerización:** Se proporciona un `Dockerfile` para construir una imagen de la aplicación, facilitando el despliegue en cualquier entorno compatible con Docker.

#### 8.3. Diseño del Frontend

- **Framework:** **Nuxt.js 4.1.0** (un framework sobre Vue.js).
- **Renderizado:** Configurado como `ssr: false`, lo que la convierte en una aplicación de lado del cliente (Client-Side Rendering).
- **Lenguaje:** TypeScript.
- **Comunicación API:** **Apollo Client** (`@nuxtjs/apollo`) se utiliza para consumir la API GraphQL del backend. La configuración en `nuxt.config.ts` apunta a `https://three-assured-ian-impressive.trycloudflare.com/graphql`.
- **Gestión de Estado:** **Pinia** (`@pinia/nuxt`) para un manejo de estado centralizado y reactivo. `pinia-plugin-persistedstate` se usa para mantener el estado en el almacenamiento local del navegador.
- **UI/UX:**
  - **Componentes:** **Nuxt UI**, una librería de componentes basada en Tailwind CSS.
  - **Estilos:** Tailwind CSS y CSS personalizado en `assets/css/main.css`.
- **Calidad de Código:** ESLint, Oslint y Prettier para mantener un código limpio y consistente.

### 9. Plan de Desarrollo

- **Metodología:** Dadas las herramientas (proyectos separados, pruebas, etc.), se sugiere una **metodología Ágil (Scrum)**. Los sprints pueden enfocarse en desarrollar "verticales" de funcionalidades (backend y frontend simultáneamente).
- **Cronograma:**
  - **Fase 1: Configuración y Core.** Desarrollo de entidades base (Producto, Bodega, Unidades) y la estructura de la UI para gestionarlas.
  - **Fase 2: Módulo de Órdenes de Producción.** Implementación del flujo principal de creación y seguimiento de órdenes.
  - **Fase 3: Módulo de Inventario.** Implementación de movimientos, conteos cíclicos y puntos de reorden.
  - **Fase 4: Reportes y Dashboards.** Creación de vistas para analizar datos de producción y costos.
- **Roles del Equipo:**
  - **Desarrollador Backend:** Responsable de la API GraphQL, lógica de negocio y base de datos.
  - **Desarrollador Frontend:** Responsable de la interfaz de usuario en Nuxt.js.
  - **Tester/QA:** Encargado de las pruebas E2E con Cypress y pruebas manuales.

### 10. Gestión de Riesgos

- **Riesgo:** Desincronización entre el schema de GraphQL del backend y las queries del frontend.
  - **Mitigación:** Mantener el archivo `schema-back.graphqls` en el proyecto frontend como "fuente de verdad" y usar herramientas de generación de código para tipar las queries de Apollo.
- **Riesgo:** Lógica de negocio compleja en la gestión de producción.
  - **Mitigación:** Usar BDD con Cucumber (ya configurado en el backend) para definir y validar el comportamiento esperado con ejemplos claros.
- **Riesgo:** El rendimiento de la base de datos puede degradarse con un alto volumen de transacciones de inventario.
  - **Mitigación:** Indexación adecuada de tablas críticas y optimización de queries JPA.

### 11. Pruebas y Aseguramiento de Calidad

- **Backend:**
  - **Pruebas Unitarias/Integración:** JUnit 5 y `@springframework/boot-starter-test`. Se usa una base de datos en memoria (H2) para los tests.
  - **Pruebas de Comportamiento (BDD):** **Cucumber** (`io.cucumber`) para validar flujos de negocio.
  - **Pruebas de API:** `spring-graphql-test` para probar las queries y mutations de GraphQL.
- **Frontend:**
  - **Pruebas End-to-End (E2E):** **Cypress** (`cypress.config.ts`) para simular la interacción del usuario en un navegador real.
  - **Pruebas Unitarias/Componentes:** `@nuxt/test-utils` (probablemente con Vitest) para probar componentes de Vue y lógica de Pinia.

### 12. Plan de Despliegue

- **Backend:**
  1.  Construir el archivo JAR ejecutable usando `./gradlew bootJar`.
  2.  Construir la imagen de Docker usando el `Dockerfile`.
  3.  Publicar la imagen en un registro de contenedores (ej. Docker Hub, AWS ECR).
  4.  Desplegar el contenedor en un orquestador como Kubernetes o un servicio como AWS Fargate, configurando las variables de entorno para la base de datos de producción.
- **Frontend:**
  1.  Ejecutar `pnpm build` para generar los archivos estáticos de la SPA.
  2.  Subir el contenido del directorio `.output/public` a un servicio de alojamiento de estáticos como AWS S3, Vercel o Netlify.
- **Base de Datos:** Las migraciones de Flyway se ejecutarán automáticamente al iniciar la aplicación backend, asegurando que el esquema de la base de datos esté actualizado.

### 13. Mantenimiento y Sorte

- **Correctivo:** Se utilizará el sistema de issues de Git para reportar y dar seguimiento a los bugs. Las correcciones seguirán el mismo flujo de CI/CD que las nuevas funcionalidades.
- **Evolutivo:** Las nuevas funcionalidades se planificarán en el backlog del proyecto y se desarrollarán en futuros sprints.
- **Preventivo:** Actualización periódica de dependencias (Spring Boot, Nuxt, etc.) para mitigar vulnerabilidades y mejorar el rendimiento.

### 14. Presupuesto y Costos

- **Recursos Humanos:** Costos asociados a los roles definidos (desarrolladores, testers).
- **Recursos Técnicos:**
  - **Servidores:** Costo de hosting para el backend (ej. AWS EC2/Fargate) y el frontend (ej. AWS S3/Vercel).
  - **Base de Datos:** Costo de una base de datos gestionada (ej. AWS RDS para PostgreSQL).
  - **CI/CD:** Costo de herramientas como GitHub Actions para automatización.
- **Costos Indirectos:** Licencias de software (si aplica), capacitación.

### 15. Anexos

- **Glosario de Términos:** El archivo `schema-back.graphqls` sirve como un glosario funcional, definiendo todas las entidades de negocio del sistema (OrdenProduccion, Lote, Bodega, etc.).
- **Documentación de API:** La naturaleza auto-documentada de GraphQL, junto con herramientas como Apollo Studio o Postman, permite explorar y probar la API de forma interactiva.
