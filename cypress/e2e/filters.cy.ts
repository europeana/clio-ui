describe('Filters', () => {

describe('prefilling', () => {
  it('prefills the dataset id', () => {
    const id = 71;
    cy.visit(`/?dataset-id=${id}`);
    cy.get('[data-e2e=dataset-id]').should('have.value', id);
  })

  it('prefills the batch id', () => {
    const id = 25;
    cy.visit(`/?batch-id=${id}`);
    cy.get('[data-e2e=batch-id]').should('have.value', id);
  })

  it('prefills the filters (provider)', () => {
    const provider = 'CultureGrid';
    cy.visit(`/?provider=${provider}`);
    cy.get('.checkmarked-checkbox.checked + .checkbox-label').contains(provider).should('exist');
  })

  it('prefills the filters (data provider)', () => {
    const dataProvider = 'Tbilisi History Museum, Georgia';
    cy.visit(`/?dataProvider=${dataProvider}`);
    cy.get('.checkmarked-checkbox.checked + .checkbox-label').contains(dataProvider).should('exist');
  })

  it('prefills the date (from)', () => {
    const date = '2026-01-19';
    cy.visit(`/?date-from=${date}`);
    cy.get('[data-e2e=date-from]').should('have.value', date);
  })

  it('prefills the date (to)', () => {
    const date = '2026-12-31';
    cy.visit(`/?date-to=${date}`);
    cy.get('[data-e2e=date-to]').should('have.value', date);
  })

})

})
