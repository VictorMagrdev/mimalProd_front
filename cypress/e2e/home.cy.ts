/// <reference types="Cypress" />
describe('home page', () => {
  it('passes', () => {
    cy.visit('http://192.168.115.202:3000/')
    cy.contains('Nuxt')
  })
})