describe("Funcionalidad de Gestión de Roles", () => {
  beforeEach(() => {
    cy.login();
    cy.visit("http://192.168.0.104:3000/usuarios/roles");
  });

  context("Dado que el usuario está en la página de gestión de roles", () => {
    it("Entonces debe mostrar la lista de roles", () => {
      cy.contains("h1", "Roles");
      cy.get(".role-list-item").should("have.length.greaterThan", 0);
    });

    context("Cuando el usuario crea un nuevo rol", () => {
      it("Entonces el nuevo rol debe aparecer en la lista", () => {
        cy.get("[data-cy=new-role-name]").type("Rol de Prueba");
        cy.get("[data-cy=create-role-button]").click();
        cy.contains(".role-list-item", "Rol de Prueba").should("be.visible");
      });
    });

    context("Cuando el usuario asigna un rol a un usuario", () => {
      it("Entonces debe mostrar una confirmación de éxito", () => {
        cy.get("[data-cy=user-select]").select("1");
        cy.get("[data-cy=role-select]").select("2");
        cy.get("[data-cy=assign-role-button]").click();
        cy.get(".success-message").should(
          "contain",
          "Rol asignado correctamente",
        );
      });
    });
  });
});
