describe("Funcionalidad de Gestión de Políticas", () => {
  beforeEach(() => {
    cy.login();
    cy.visit("http://192.168.0.104:3000/usuarios/politicas");
  });

  context(
    "Dado que el usuario está en la página de gestión de políticas",
    () => {
      it("Entonces debe mostrar el formulario de creación de políticas", () => {
        cy.contains("h1", "Políticas");
        cy.get("form[data-cy=new-policy-form]").should("be.visible");
      });

      context("Cuando el usuario crea una nueva política", () => {
        it("Entonces se debe mostrar un mensaje de éxito", () => {
          cy.get("input[data-cy=policy-name]").type("Puede ver el Dashboard");
          cy.get("textarea[data-cy=policy-description]").type(
            "Permite al usuario ver el dashboard principal",
          );
          cy.get("[data-cy=create-policy-button]").click();
          cy.get(".success-message").should(
            "contain",
            "Política creada correctamente",
          );
        });
      });
    },
  );
});
