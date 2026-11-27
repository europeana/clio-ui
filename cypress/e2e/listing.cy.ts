describe('Filters Dynamic Operations Flow', () => {
  beforeEach(() => {
    cy.visit(`/`);
  });

  const selSublist = '.sublisting.run-list';

  it('show the list', () => {
    cy.get('.listing').should('exist');
    cy.get('.sublisting').should('exist');
  });

  it('show the sub list', () => {
    cy.get(selSublist).should('not.exist');
    cy.get('.sublisting').eq(1).find('.opener').click();
    cy.get(selSublist).should('exist');
  });

  it('preserves the dates!', () => {
    const checkDateValue = () => {
      cy.get('.sublisting')
        .eq(1)
        .find('.last-cell .time')
        .contains('20 Nov 2026')
        .should('exist');
    };

    checkDateValue();
    cy.get('.sublisting').eq(1).find('.opener').click();
    checkDateValue();
  });
});
