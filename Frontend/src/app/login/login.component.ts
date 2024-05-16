import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from './services/auth.services';
import { LoginModel } from './models/login.model';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  constructor(
        private _auth: AuthService,
        private _router: Router
  ){
  }

  login(form:NgForm){
    if (form.valid) {
      let model = new LoginModel();
      model.email = form.controls["email"].value;
      model.password = form.controls["password"].value;

      this._auth.login(model, res=>{
        localStorage.setItem("token",res.token);
        localStorage.setItem("user", JSON.stringify(res.user));
        this._router.navigateByUrl("/");
      })
    }
  }
}
