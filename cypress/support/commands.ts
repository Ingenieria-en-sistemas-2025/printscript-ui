/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }
Cypress.Commands.add('getBearerFromApi', () => {
  //registro 2 intercepts por si uno falla primero
  cy.intercept('GET', `${Cypress.env('BACKEND_URL')}/snippets/config/filetypes`).as('filetypes');
  cy.intercept('GET', `${Cypress.env('BACKEND_URL')}/snippets/all*`).as('list');

  // Visit dispare los XHR
  cy.visit(Cypress.env('FRONTEND_URL'));

  //esperona que llegue cualquiera de los dos
  return cy.wait(['@filetypes', '@list'], { timeout: 20000 }).then((results) => {
    // results puede ser un array (si ambas respondieron) o un solo objeto (según Cypress)
    const events = Array.isArray(results) ? results : [results];
    const first = events.find(Boolean)!;

    const hdrs = first.request.headers as Record<string, string | undefined>;
    const auth = hdrs['authorization'] || hdrs['Authorization'];
    if (!auth) throw new Error('Authorization header no presente en la request interceptada');
    const token = auth.replace(/^Bearer\s+/i, '');
    expect(token, 'bearer token capturado del XHR').to.have.length.greaterThan(100);
    return token;
  });
});