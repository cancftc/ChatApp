import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { UserModel } from '../login/models/user.model';
import { GenericHttpService } from '../services/generic-http.services';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ChatService } from './services/chat.service';
import { ChatModel } from './models/chat.model';
import { ChatModel2 } from './models/chatModel2';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit{
  users: UserModel[] = [];
  selectedUser: UserModel = new UserModel();
  message: string = "";
  chatId: string = "";
  chat: ChatModel2 = new ChatModel2();
  constructor(
    private _http: GenericHttpService,
    private _chat: ChatService
  ) { }
  ngOnInit(): void {
    this.getAll();
  }

  getAll(){
    this._http.get<UserModel[]>("auth/getAll", res=> this.users = res );    
  }
  
  changeUser(user: UserModel) {
    this.selectedUser = user;
    this.crate();
    this.getByChat();
}
  

  crate(){
    let userString = localStorage.getItem("user");
    let user = userString ? JSON.parse(userString) : null;

    let chat = new ChatModel();
    chat.userId = user._id;
    chat.toUserId = this.selectedUser._id;
    chat.message = this.message;
    
    
    this._chat.create(chat, res=> {
      console.log(res.message);
      this.chatId = res.message;

      this.message = "";
      
    })
    
  }

  add(){
    this._chat.add(this.chatId, this.message, res=> {
      console.log(res.message);
      this.message = "";
    })
    this.getByChat();
  }

  getByChat() {
    let model = {_id: this.chatId}
    this._chat.getByChat(model, res => {
      this.chat = res;
      console.log(res); // res'i consoloda yazdır
    })
}
}
