import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { UserModel } from '../login/models/user.model';
import { GenericHttpService } from '../services/generic-http.services';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit{
  users: UserModel[] = [];
  
  constructor(
    private _http: GenericHttpService
  ) { }
  ngOnInit(): void {
    this.getAll();
  }

  getAll(){
    this._http.get<UserModel[]>("auth/getAll", res=> this.users = res );    
  }
}
