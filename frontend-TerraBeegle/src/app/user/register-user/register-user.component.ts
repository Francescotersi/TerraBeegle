import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { form, FormField, required, email, minLength } from '@angular/forms/signals';
import { LiquidGlassComponent } from '../../ui/liquid-glass/liquid-glass.component';

interface UserModel {
  name: string;
  surname: string;
  username: string;
  email: string;
  password: string;
}

@Component({
  selector: 'app-register-user',
  imports: [LiquidGlassComponent, FormField, RouterLink],
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
                  <label for="surname" class="form-label fw-semibold small text-dark">Last name</label>
                  <input
                    type="text"
                    id="surname"
                    class="form-control glass-input"
                    placeholder="Rossi"
                    [formField]="registerForm.surname"
                    [class.is-invalid]="registerForm.surname().invalid() && registerForm.surname().touched()"
                  />
                  @if (registerForm.surname().invalid() && registerForm.surname().touched()) {
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
                  <div class="invalid-feedback fw-medium">The password must be at least 6 characters long.</div>
                }
              </div>
              <!-- Register -->
              <button
                type="submit"
                class="btn btn-primary w-100 py-2 fw-semibold glass-btn shadow-sm"
                [disabled]="registerForm().invalid()"
              >
                Register
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
      background: rgba(255, 255, 255, 0.45);
      border: 1px solid rgba(255, 255, 255, 0.8);
      color: #0f172a;
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      border-radius: 12px;
      padding: 0.65rem 0.9rem;
      transition: all 0.25s ease;
    }
    .glass-input::placeholder {
      color: #94a3b8;
    }
    .glass-input:focus {
      background: rgba(255, 255, 255, 0.75);
      border-color: #38bdf8;
      box-shadow: 0 0 0 4px rgba(56, 189, 248, 0.22);
      outline: none;
    }
    .glass-btn {
      background: linear-gradient(135deg, #38bdf8 0%, #0284c7 100%);
      border: 1px solid rgba(255, 255, 255, 0.4);
      border-radius: 12px;
      transition: all 0.25s ease;
    }
    .glass-btn:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 8px 20px rgba(56, 189, 248, 0.4) !important;
      background: linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%);
    }
    .glass-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .glass-link {
      color: #0284c7;
      transition: color 0.2s ease;
    }
    .glass-link:hover {
      color: #0369a1;
      text-decoration: underline !important;
    }
  `,
})
export class RegisterUser {
  protected readonly userModel = signal<UserModel>({
    name: '',
    surname: '',
    username: '',
    email: '',
    password: '',
  });

  protected readonly registerForm = form(this.userModel, (schema) => {
    required(schema.name, { message: 'Name is required' });
    minLength(schema.name, 1, { message: 'Name must be at least 1 characters long' });

    required(schema.surname, { message: 'Surname is required' });
    minLength(schema.surname, 1, { message: 'Surname must be at least 1 characters long' });

    required(schema.username, { message: 'Username is required' });
    minLength(schema.username, 1, { message: 'Username must be at least 3 characters long' });

    required(schema.email, { message: 'Email is required' });
    email(schema.email);

    required(schema.password, { message: 'Password is required' });
    minLength(schema.password, 6, { message: 'Password must be at least 6 characters long' });
  });

  protected onSubmit(): void {
      if (this.registerForm().valid()) {
      const data = this.userModel();
      console.log('Dati di register pronti per il backend .NET:', data);

    }
  }
}
