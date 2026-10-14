describe('Clio UI', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('loads', () => {
    cy.get('.logo').should('exist');
  });

  it('shows the legal info', () => {
    cy.get('.legal').should('exist');
  });

  it('should paginate', () => {
    const checkFirstOpenerLabel = (expected: string): void => {
      cy.get('.sublisting')
        .first()
        .find('.opener-content')
        .should('contain.text', expected);
    };
    const selNext = '.result-nav a:last-child';
    const selPrev = '.result-nav a:first-child';

    checkFirstOpenerLabel('0');
    cy.get(selNext).click();
    checkFirstOpenerLabel('25');
    cy.get(selNext).click();
    checkFirstOpenerLabel('50');
    cy.get(selPrev).click();
    checkFirstOpenerLabel('25');
    cy.get(selPrev).click();
    checkFirstOpenerLabel('0');
  });
});
