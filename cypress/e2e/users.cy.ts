describe("Funcionalidad de Gestión de Usuarios", () => {
  beforeEach(() => {
    cy.login();
  });

  context("Dado que el usuario está en la página de lista de usuarios", () => {
    beforeEach(() => {
      cy.visit("http://192.168.0.104:3000/usuarios");
    });

    it("Entonces debe mostrar la lista de usuarios", () => {
      cy.contains("h1", "Usuarios");
      cy.get(".user-list-item").should("have.length.greaterThan", 0);
    });

    context('Cuando el usuario hace clic en el botón "Nuevo Usuario"', () => {
      beforeEach(() => {
        cy.get("[data-cy=new-user-button]").click();
      });

      it("Entonces debe mostrar el formulario de nuevo usuario", () => {
        cy.get("form[data-cy=new-user-form]").should("be.visible");
      });

      it("Y cuando el usuario llena el formulario y lo envía, se debe crear un nuevo usuario", () => {
        cy.get("input[data-cy=user-name]").type("Nuevo Usuario de Prueba");
        cy.get("input[data-cy=user-username]").type("nuevouser.test");
        cy.get("form[data-cy=new-user-form] button[type=submit]").click();
        cy.contains(".user-list-item", "Nuevo Usuario de Prueba").should(
          "be.visible",
        );
      });
    });

    context("Cuando el usuario hace clic en un usuario específico", () => {
      it("Entonces debe navegar a la página de detalles del usuario", () => {
        cy.get(".user-list-item a").first().click();
        cy.url().should("match", /\/usuarios\/\d+$/);
        cy.contains("h1", "Detalles de Usuario");
      });
    });
  });
});
