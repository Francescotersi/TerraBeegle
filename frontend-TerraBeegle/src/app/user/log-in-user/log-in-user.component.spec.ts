import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LogInUser } from './log-in-user.component';

describe('LogInUserComponent', () => {
  let component: LogInUser;
  let fixture: ComponentFixture<LogInUser>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogInUser],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(LogInUser);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
