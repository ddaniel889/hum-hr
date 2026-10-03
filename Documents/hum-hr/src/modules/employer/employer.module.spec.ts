import { EmployerModule } from './employer.module';

describe('EmployerModule', () => {
  let employerModule: EmployerModule;

  beforeEach(() => {
    employerModule = new EmployerModule();
  });

  it('should create an instance', () => {
    expect(employerModule).toBeTruthy();
  });
});
