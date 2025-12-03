describe('Clio UI', () => {

  it('passes', () => {
    cy.visit('/');
    cy.get('.logo').should('exist');
  })
})
