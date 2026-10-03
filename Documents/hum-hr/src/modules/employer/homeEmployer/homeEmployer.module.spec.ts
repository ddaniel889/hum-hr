import { HomeEmployerModule } from './homeEmployer.module';

describe('HomeEmployerModule', () => {
  let homeEmployerModule: HomeEmployerModule;

  beforeEach(() => {
    homeEmployerModule = new HomeEmployerModule();
  });

  it('should create an instance', () => {
    expect(homeEmployerModule).toBeTruthy();
  });
});
