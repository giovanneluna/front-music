describe("Home page", () => {
  it("should navigate to the home page", () => {
    cy.visit("/")
    cy.url().should("include", "/")
    cy.get("body").should("be.visible")
  })
})
