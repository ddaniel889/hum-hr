import { WelcomeEmployerModule } from './welcomeEmployer.module';

describe('WelcomeEmployerModule', () => {
  let welcomeEmployerModule: WelcomeEmployerModule;

  beforeEach(() => {
    welcomeEmployerModule = new WelcomeEmployerModule();
  });

  it('should create an instance', () => {
    expect(welcomeEmployerModule).toBeTruthy();
  });
});
