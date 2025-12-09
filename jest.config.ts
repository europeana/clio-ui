import type { Config } from 'jest';
import { createCjsPreset } from 'jest-preset-angular/presets';

export default {
  ...createCjsPreset(),
  setupFilesAfterEnv: ['./setup-jest.ts'],
  testEnvironment: './FixJsDomEnvironment.ts',
  coverageReporters: ['lcov', 'html']
} satisfies Config;
