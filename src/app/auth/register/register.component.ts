import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../service/auth.service';
import { Router } from '@angular/router';
import { TokenStorageService } from '../../service/token-storage.service';
import { NotificationService } from '../../service/notification.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  public registerForm: FormGroup;
  public username: AbstractControl;
  public email: AbstractControl;
  public firstname: AbstractControl;
  public lastname: AbstractControl;
  public password: AbstractControl;
  public confirmPassword: AbstractControl;
  public hidePassword = true;
  public hideConfirmPassword = true;

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private tokenStorage: TokenStorageService,
    private router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.registerForm = this.createRegisterForm();
    this.username = this.registerForm.get('username');
    this.email = this.registerForm.get('email');
    this.firstname = this.registerForm.get('firstname');
    this.lastname = this.registerForm.get('lastname');
    this.password = this.registerForm.get('password');
    this.confirmPassword = this.registerForm.get('confirmPassword');
  }

  createRegisterForm(): FormGroup {
    return this.fb.group({
      email: ['', Validators.compose([Validators.required, Validators.email])],
      username: ['', Validators.compose([Validators.required])],
      firstname: ['', Validators.compose([Validators.required])],
      lastname: ['', Validators.compose([Validators.required])],
      password: [
        '',
        Validators.compose([Validators.required, Validators.minLength(6)]),
      ],
      confirmPassword: [
        '',
        Validators.compose([Validators.required, Validators.minLength(6)]),
      ],
    });
  }

  submit(): void {
    console.log(this.registerForm.value);

    this.authService
      .register({
        email: this.registerForm.value.email,
        username: this.registerForm.value.username,
        firstname: this.registerForm.value.firstname,
        lastname: this.registerForm.value.lastname,
        password: this.registerForm.value.password,
        confirmPassword: this.registerForm.value.confirmPassword,
      })
      .subscribe(
        (data) => {
          console.log(data);
          this.notificationService.showSnackBar('Successfully Registered!');
          this.authService
            .login({
              username: this.registerForm.value.email,
              password: this.registerForm.value.password,
            })
            .subscribe((data) => {
              console.log(data);

              this.tokenStorage.saveToken(data.token);
              this.tokenStorage.saveUser(data);
              window.location.reload();
            });
          this.router.navigate(['/main']);
        },
        (error) => {
          this.notificationService.showSnackBar(
            'Користувач з таким email уже існує'
          );
        }
      );
  }
}
