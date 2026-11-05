import { Component, signal, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { form, FormField, required, email, minLength } from '@angular/forms/signals';
import { LiquidGlassComponent } from '../../../ui/liquid-glass/liquid-glass.component';
import { SpinnerComponent } from '../../../ui/spinner/spinner.component';
import { AuthService } from '../../../services/auth.service';

interface UserModel {
  name: string;
  familyName: string;
  username: string;
  email: string;
  password: string;
}

@Component({
  selector: 'app-register-user',
  imports: [LiquidGlassComponent, FormField, RouterLink, SpinnerComponent],
 template: `
    <div class="container py-5 d-flex justify-content-center align-items-center min-vh-75">
      <div class="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
        
        <app-liquid-glass borderRadius="28px" background="rgba(255, 255, 255, 0.22)" [scale]="95">
          <div class="p-4 p-md-5">
            
            <div class="text-center mb-4">
              <h2 class="h3 fw-bold text-dark mb-1">Create Account</h2>
              <p class="text-secondary small mb-0">Join the TerraBeegle community</p>
            </div>
            <form (submit)="$event.preventDefault(); onSubmit()">

              <div class="row g-2 mb-3">
                <div class="col-6">
                  <label for="name" class="form-label fw-semibold small text-dark">First name</label>
                  <input
                    type="text"
                    id="name"
                    class="form-control glass-input"
                    placeholder="Mario"
                    [formField]="registerForm.name"
                    [class.is-invalid]="registerForm.name().invalid() && registerForm.name().touched()"
                  />
                  @if (registerForm.name().invalid() && registerForm.name().touched()) {
                    <div class="invalid-feedback fw-medium">First name is required.</div>
                  }
                </div>
                <!-- Name e Username -->
                <div class="col-6">
                  <label for="familyName" class="form-label fw-semibold small text-dark">Last name</label>
                  <input
                    type="text"
                    id="familyName"
                    class="form-control glass-input"
                    placeholder="Rossi"
                    [formField]="registerForm.familyName"
                    [class.is-invalid]="registerForm.familyName().invalid() && registerForm.familyName().touched()"
                  />
                  @if (registerForm.familyName().invalid() && registerForm.familyName().touched()) {
                    <div class="invalid-feedback fw-medium">Last name is required.</div>
                  }
                </div>
              </div>
              <!-- Username -->
              <div class="mb-3">
                <label for="username" class="form-label fw-semibold small text-dark">Username</label>
                <input
                  type="text"
                  id="username"
                  class="form-control glass-input"
                  placeholder="mario_rossi"
                  [formField]="registerForm.username"
                  [class.is-invalid]="registerForm.username().invalid() && registerForm.username().touched()"
                />
                @if (registerForm.username().invalid() && registerForm.username().touched()) {
                  <div class="invalid-feedback fw-medium">Username is required (at least 3 characters).</div>
                }
              </div>
              <!-- Email -->
              <div class="mb-3">
                <label for="email" class="form-label fw-semibold small text-dark">Email</label>
                <input
                  type="email"
                  id="email"
                  class="form-control glass-input"
                  placeholder="mario.rossi@esempio.com"
                  [formField]="registerForm.email"
                  [class.is-invalid]="registerForm.email().invalid() && registerForm.email().touched()"
                />
                @if (registerForm.email().invalid() && registerForm.email().touched()) {
                  <div class="invalid-feedback fw-medium">Enter a valid email address.</div>
                }
              </div>
              <!-- Password -->
              <div class="mb-4">
                <label for="password" class="form-label fw-semibold small text-dark">Password</label>
                <input
                  type="password"
                  id="password"
                  class="form-control glass-input"
                  placeholder="••••••••"
                  [formField]="registerForm.password"
                  [class.is-invalid]="registerForm.password().invalid() && registerForm.password().touched()"
                />
                @if (registerForm.password().invalid() && registerForm.password().touched()) {
                  <div class="invalid-feedback fw-medium">The password must be at least 8 characters long.</div>
                }
              </div>

              <!-- Errore dal backend -->
              @if (errorMessage()) {
                <div class="alert alert-danger py-2 px-3 small mb-3 text-center fw-medium border-0 shadow-sm" style="border-radius: 12px; background: rgba(239, 68, 68, 0.15); color: #dc2626;">
                  {{ errorMessage() }}
                </div>
              }

              <!-- Register -->
              <button
                type="submit"
                class="btn btn-primary w-100 py-2 fw-semibold glass-btn shadow-sm d-flex align-items-center justify-content-center gap-2"
                [disabled]="registerForm().invalid() || isLoading()"
              >
                @if (isLoading()) {
                  <app-spinner size="btn" />
                  <span>Creating account...</span>
                } @else {
                  <span>Register</span>
                }
              </button>
              <!-- Link a Login -->
              <div class="text-center mt-4">
                <span class="small text-muted">Already have an account? </span>
                <a routerLink="/login" class="small fw-semibold glass-link text-decoration-none">
                  Log in
                </a>
              </div>
            </form>
          </div>
        </app-liquid-glass>
      </div>
    </div>
  `,
  styles: `
    .min-vh-75 {
      min-height: 75vh;
    }
    .glass-input {
      background: var(--tb-input-bg);
      border: 1px solid var(--tb-input-border);
      color: var(--tb-text);
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      border-radius: 12px;
      padding: 0.65rem 0.9rem;
      transition: all 0.25s ease;
    }
    .glass-input::placeholder {
      color: var(--tb-text-muted);
    }
    .glass-input:focus {
      background: var(--tb-input-bg-focus);
      border-color: var(--tb-accent);
      box-shadow: 0 0 0 4px var(--tb-accent-glow);
      color: var(--tb-text);
      outline: none;
    }
    .glass-btn {
      background: var(--tb-btn-gradient);
      border: 1px solid var(--tb-glass-border);
      border-radius: 12px;
      transition: all 0.25s ease;
    }
    .glass-btn:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 8px 20px var(--tb-btn-gradient-shadow) !important;
      background: var(--tb-btn-gradient-hover);
    }
    .glass-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .glass-link {
      color: var(--tb-accent);
      transition: color 0.2s ease;
    }
    .glass-link:hover {
      color: var(--tb-accent-hover);
      text-decoration: underline !important;
    }
  `,
})
export class RegisterUser {
  private readonly authService = inject(AuthService);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly router = inject(Router);

  protected readonly userModel = signal<UserModel>({
    name: '',
    familyName: '',
    username: '',
    email: '',
    password: '',
  });

  protected readonly registerForm = form(this.userModel, (schema) => {
    required(schema.name, { message: 'Name is required' });
    minLength(schema.name, 1, { message: 'Name must be at least 1 characters long' });

    required(schema.familyName, { message: 'familyName is required' });
    minLength(schema.familyName, 1, { message: 'familyName must be at least 1 characters long' });

    required(schema.username, { message: 'Username is required' });
    minLength(schema.username, 1, { message: 'Username must be at least 3 characters long' });

    required(schema.email, { message: 'Email is required' });
    email(schema.email);

    required(schema.password, { message: 'Password is required' });
    minLength(schema.password, 8, { message: 'Password must be at least 8 characters long' });
  });

  protected onSubmit(): void {
    if (this.registerForm().invalid() || this.isLoading()) {
      return;
    }
    const data = this.userModel();
    
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.authService.register(this.userModel()).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        console.log('Registration was successfull', data);
        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.isLoading.set(false);
        
        if (error.error?.detail) {
          this.errorMessage.set(error.error.detail);
        } else if (error.error?.errors) {
          const firstKey = Object.keys(error.error.errors)[0];
          this.errorMessage.set(error.error.errors[firstKey][0]);
        } else {
          this.errorMessage.set('Registration failed. Please check your inputs.');
        }
      }
    });  
  }
}
