import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService, User } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: routerSpy }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should register a user', () => {
    const payload = { email: 'test@test.com', password: 'password', displayName: 'Test' };
    const mockResponse = { message: 'User registered successfully!' };

    service.register(payload).subscribe(response => {
      expect(response.message).toBe('User registered successfully!');
    });

    const req = httpMock.expectOne('/api/auth/register');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should login a user and save to storage', () => {
    const payload = { email: 'test@test.com', password: 'password' };
    const mockUser: User = { email: 'test@test.com', displayName: 'Test', token: 'fake-jwt-token' };

    service.login(payload).subscribe(user => {
      expect(user).toEqual(mockUser);
      expect(localStorage.getItem('auth_user')).toContain('fake-jwt-token');
    });

    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush(mockUser);

    expect(service.user).toEqual(mockUser);
    expect(service.getToken()).toBe('fake-jwt-token');
  });

  it('should logout a user and clear storage', () => {
    const mockUser: User = { email: 'test@test.com', displayName: 'Test', token: 'fake-jwt-token' };
    localStorage.setItem('auth_user', JSON.stringify(mockUser));
    
    // Trigger internal private user loading by re-creating or manually setting
    // But since it's private, we'll just test the logout logic
    service.logout();

    expect(localStorage.getItem('auth_user')).toBeNull();
    expect(service.user).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
