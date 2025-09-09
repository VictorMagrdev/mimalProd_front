/// <reference types="Cypress" />

describe("Autenticación y sesión (JWT) - Frontend", () => {
  beforeEach(() => {
    // Limpiar localStorage antes de cada test para evitar estado persistente
    cy.clearLocalStorage();
  });

  it("Login exitoso y obtención de JWT", () => {
    cy.visit("http://192.168.0.104:3000/login");

    cy.get("input[name=username]", { timeout: 10000 })
      .should("be.visible")
      .type("admin");
    cy.get("input[name=password]").should("be.visible").type("admin123");

    cy.get("button[type=submit]").click();
    cy.get("nav", { timeout: 10000 }).should("be.visible");
    // Valida redirección al dashboard
    cy.url().should("include", "http://192.168.0.104:3000/");

    // Valida que se haya guardado el JWT en localStorage
    cy.window().then((win) => {
      const token = win.localStorage.getItem("token");
      console.log("Token almacenado:", token); // Para depuración
      expect(token);
    });
  });

  it("Login fallido con contraseña incorrecta", () => {
    cy.visit("http://192.168.0.104:3000/login");

    cy.get("input[name=username]").type("admin");
    cy.get("input[name=password]").type("wrong1234");
    cy.get("button[type=submit]").click();

    // Espera mensaje de error que realmente se muestra en la UI
    cy.contains("Invalid credentials").should("be.visible");

    // Asegura que no se haya guardado token
    cy.window().then((win) => {
      expect(win.localStorage.getItem("token")).to.be.null;
    });
  });

  it("Usuario desactivado no puede iniciar sesión", () => {
    cy.visit("http://192.168.0.104:3000/login");

    cy.get("input[name=username]").type("pepe");
    cy.get("input[name=password]").type("secret1234");
    cy.get("button[type=submit]").click();

    // Espera mensaje de error específico
    cy.contains("Invalid credentials").should("be.visible");

    // Asegura que no se haya guardado token
    cy.window().then((win) => {
      expect(win.localStorage.getItem("token")).to.be.null;
    });
  });

  it("Logout invalida el token", () => {
    cy.visit("http://192.168.0.104:3000/login");
    // Login primero
    cy.get("input[name=username]", { timeout: 10000 })
      .should("be.visible")
      .type("admin", { force: true });
    cy.get("input[name=password]")
      .should("be.visible")
      .type("admin123", { force: true });

    cy.get("button[type=submit]").click();

    cy.url().should("include", "http://192.168.0.104:3000/");

    cy.get('button[aria-haspopup="menu"]').click();

    cy.contains("Cerrar sesión").click();

    cy.url().should("eq", "http://192.168.0.104:3000/login");

    // Y borrar token
    cy.window().then((win) => {
      expect(win.localStorage.getItem("token")).to.be.null;
    });
  });
});
