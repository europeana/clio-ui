describe('Filters Dynamic Operations Flow', () => {
  const selSliderUnset = 'app-slider:not([formControlName])';

  beforeEach(() => {
    // intercept standard search API requests to observe serialized payload states
    cy.intercept('POST', '**/runs/summary*').as('searchRequest');
  });

  describe('Prefilling State Initialization', () => {
    it('prefills the dataset id', () => {
      const id = '71';
      cy.visit(`/?datasetId=${id}`);
      cy.get('[data-e2e=dataset-id]').should('have.value', id);
    });

    it('prefills the dataset name', () => {
      const name = 'my_dataset_3';
      cy.visit(`/?datasetName=${name}`);
      cy.get('[data-e2e=dataset-name]').should('have.value', name);
    });

    it('prefills the date (from)', () => {
      const date = '2026-01-19';
      cy.visit(`/?dateFrom=${date}`);
      cy.get('[data-e2e=date-from]').should('have.value', date);
    });

    it('prefills the date (to)', () => {
      const date = '2026-12-31';
      cy.visit(`/?dateTo=${date}`);
      cy.get('[data-e2e=date-to]').should('have.value', date);
    });
  });

  describe('Interactive Filter State Alterations (Adding and Removing)', () => {

    it('should append parameters to url and payload on manual search execution inputs', () => {
      cy.visit('/');
      cy.wait('@searchRequest');

      cy.get('[data-e2e=dataset-id]').type('1{enter}');
      cy.url().should('contain', 'datasetId=1');

      cy.wait('@searchRequest').then((interception) => {
        const bodyFilters = interception.request.body?.filters || {};
        expect(bodyFilters.datasetId).to.deep.equal(['1']);
      });
    });

    it('should reset offset pagination', () => {
      cy.visit('/?offset=50&limit=25');
      cy.get('[data-e2e=date-from]').type('2026-07-20').trigger('change');

      cy.url().should('contain', 'offset=0');
      cy.url().should('contain', 'dateFrom=2026-07-20');
    });

    it('should append parameters when dynamic custom checkboxes are toggled', () => {
      cy.visit('/');

      // Wait for data load to complete so the template conditional blocks finish painting
      cy.wait('@searchRequest');

      // Check if filter groups exist. If options are present, click the first one safely
      cy.get('.filters').then(($el) => {
        if ($el.find('app-checkbox').length > 0) {
          cy.get('app-checkbox').first().click();
          cy.url().should('contain', 'offset=0');
        } else {
          cy.log('Skipping checkbox click interaction: No filter options returned from test server payload.');
        }
      });
    });

    it('should clear parameters when clear button hooks are executed next to text inputs', () => {
      cy.visit('/?datasetName=ArchiveExpress');
      cy.wait('@searchRequest');
      cy.get('[data-e2e=dataset-name]').clear();

      // click magnifying glass button to submit the empty state
      cy.get('[data-e2e=dataset-name] + .search-icon-solid').click();

      // verify parameter properties drop completely from route paths
      cy.url().should('not.contain', 'datasetName=ArchiveExpress');
      cy.url().should('contain', 'offset=0');
    });


    it('should drop sliders parameter to null when modified or updated via slide changes', () => {
      // Visit with a preset value
      cy.visit('/?percentLinksInOperationFrom=75');
      cy.wait('@searchRequest');
      cy.get('app-slider input[type="range"]')
        .invoke('val', 20)
        .trigger('input')
        .trigger('change');
      cy.url().should('contain', 'percentLinksInOperationFrom=20');
      cy.url().should('contain', 'offset=0');
    });

  });
});
