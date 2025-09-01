/// <reference types="Cypress" />
describe("Autenticación y sesión (JWT) - Frontend", () => {
  it("Login exitoso y obtención de JWT", () => {
    cy.visit("/login");

    cy.get("input[name=username]").type("admin");
    cy.get("input[name=password]").type("AdminPass123");
    cy.get("button[type=submit]").click();

    // Valida redirección al dashboard
    cy.url().should("include", "/dashboard");

    // Valida que se haya guardado el JWT
    cy.window().its("localStorage.token").should("match", /^ey/);
  });

  it("Login fallido con contraseña incorrecta", () => {
    cy.visit("/login");

    cy.get("input[name=username]").type("admin");
    cy.get("input[name=password]").type("wrong");
    cy.get("button[type=submit]").click();

    // Espera mensaje de error en la UI
    cy.contains("Credenciales incorrectas").should("be.visible");
  });

  it("Usuario desactivado no puede iniciar sesión", () => {
    cy.visit("/login");

    cy.get("input[name=username]").type("pepe");
    cy.get("input[name=password]").type("secret");
    cy.get("button[type=submit]").click();

    // Espera mensaje de error específico
    cy.contains("Usuario inactivo or deshabilitado").should("be.visible");
  });

  it("Logout invalida el token", () => {
    // Login primero
    cy.visit("/login");
    cy.get("input[name=username]").type("admin");
    cy.get("input[name=password]").type("AdminPass123");
    cy.get("button[type=submit]").click();

    // Valida que estamos en dashboard
    cy.url().should("include", "/dashboard");

    // Hacer logout por UI
    cy.get("button#logout").click();

    // Debe regresar a login
    cy.url().should("include", "/login");

    // Y borrar token
    cy.window().its("localStorage.token").should("not.exist");

    // Opcional: intentar entrar al dashboard otra vez
    cy.visit("/dashboard");
    cy.url().should("include", "/login");
  });
});
