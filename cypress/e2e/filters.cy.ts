describe('Filters', () => {

  describe('prefilling', () => {

    const selSliderUnset = '#range + .clio-state.clio-state-unset';

    it('prefills the dataset id', () => {
      const id = 71;
      cy.visit(`/?datasetId=${id}`);
      cy.get('[data-e2e=dataset-id]').should('have.value', id);
    })

    it('prefills the dataset name', () => {
      const name = 'my_dataset_3';
      cy.visit(`/?datasetName=${name}`);
      cy.get('[data-e2e=dataset-name]').should('have.value', name);
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
      cy.visit(`/?dateFrom=${date}`);
      cy.get('[data-e2e=date-from]').should('have.value', date);
    })

    it('prefills the date (to)', () => {
      const date = '2026-12-31';
      cy.visit(`/?dateTo=${date}`);
      cy.get('[data-e2e=date-to]').should('have.value', date);
    })

    it('prefills the percentLinksInOperation parameter', () => {
      const percentLinksInOperationFrom = '60';
      cy.visit(`/?percentLinksInOperationFrom=${percentLinksInOperationFrom}`);
      cy.get('#range').should('have.value', percentLinksInOperationFrom);
      cy.get(selSliderUnset).should('not.exist');
    })

    it('leaves the percentLinksInOperation control unset', () => {
      cy.visit(`/`);
      cy.get(selSliderUnset).should('exist');
    })

  });

});
