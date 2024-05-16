import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '../login/services/auth.services';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RegisterModel } from '../login/models/register.module';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ FormsModule, RouterModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  model: RegisterModel = new RegisterModel();
  constructor(
    private _auth: AuthService,
    private _router: Router
  ){
    
  }
  register(form:NgForm){
    if (form.valid) {
      this._auth.register(this.model,res=>{
        localStorage.setItem("token",res.token);
        localStorage.setItem("user",JSON.stringify(res.user));
        this._router.navigateByUrl("/");
      })
    }
  }
}
