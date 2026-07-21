describe('Clio UI', () => {

  beforeEach(() => {
    cy.visit('/');
  });

  it('loads', () => {
    cy.get('.logo').should('exist');
  })

  it('shows legal info', () => {
    cy.get('.legal').should('exist');
  })
})
