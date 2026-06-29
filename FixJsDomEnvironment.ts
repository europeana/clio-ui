import JSDOMEnvironment from 'jest-environment-jsdom';

export default class FixJsDomEnvironment extends JSDOMEnvironment {
  constructor(...args: ConstructorParameters<typeof JSDOMEnvironment>) {
    super(...args);
    this.global.URL.createObjectURL = (_) => '';
    this.global.URL.revokeObjectURL = (_) => {}
    this.global.structuredClone = structuredClone;
  }
}
