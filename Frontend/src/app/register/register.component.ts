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
  images: File[] = [];
  constructor(
    private _auth: AuthService,
    private _router: Router
  ){}

  onFileSelected(event: any) {
    const files: FileList = event.target.files;
    for (let i = 0; i < files.length; i++) {
      this.images.push(files[i]);
    }
  }
  
  register(form:NgForm){
    if (form.valid) {
      const formData = new FormData();
      formData.append('name', this.model.name);
      formData.append('email', this.model.email);
      formData.append('password', this.model.password);
      for(const image of this.images){
        formData.append("images", image, image.name);
      }

      this._auth.register(formData, res=>{
        localStorage.setItem("token",res.token);
        localStorage.setItem("user",JSON.stringify(res.user));
        this._router.navigateByUrl("/");
      })
    }
  }
}
