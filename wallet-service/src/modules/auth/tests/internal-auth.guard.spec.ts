import { InternalAuthGuard } from '../guards/internal-auth.guard';

describe('InternalAuthGuard', () => {
  let guard: InternalAuthGuard;

  beforeEach(() => {
    guard = new InternalAuthGuard();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should extend AuthGuard with internal-jwt strategy', () => {
    expect(guard).toBeInstanceOf(InternalAuthGuard);
  });
});
