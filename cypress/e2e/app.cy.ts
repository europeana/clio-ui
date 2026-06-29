describe('Clio UI', () => {

  beforeEach(() => {
    cy.visit('/');
  });

  it('loads', () => {
    cy.get('.logo').should('exist');
  })
})
