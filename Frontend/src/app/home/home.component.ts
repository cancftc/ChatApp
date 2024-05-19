import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { UserModel } from '../login/models/user.model';
import { GenericHttpService } from '../services/generic-http.services';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ChatService } from './services/chat.service';
import { ChatModel } from './models/chat.model';
import { ChatModel2 } from './models/chatModel2';
import { io, Socket } from 'socket.io-client'; // Socket.IO client ekleyin

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
  socket!: Socket; // Socket.IO client tanımlayın

  constructor(
    private _http: GenericHttpService,
    private _chat: ChatService
  ) { }

  ngOnInit(): void {
    this.getAll();
    this.socket = io('http://localhost:4000'); // Socket.IO server adresini buraya girin

    // Yeni mesajları dinleyin
    this.socket.on('newMessage', (newMessage) => {
      this.chat.messages.push(newMessage); // Yeni mesajı chat içeriğine ekleyin
    });
  }

  getAll(){
    this._http.get<UserModel[]>("auth/getAll", res => this.users = res);    
  }
  
  changeUser(user: UserModel) {
    this.selectedUser = user;
    this.crate();
    if (this.chatId) {
      this.getByChat();   
    }
  }
  
  crate(){
    let userString = localStorage.getItem("user");
    let user = userString ? JSON.parse(userString) : null;

    let chat = new ChatModel();
    chat.userId = user._id;
    chat.toUserId = this.selectedUser._id;
    chat.message = this.message;
    
    this._chat.create(chat, res => {
      console.log(res.message);
      this.chatId = res.message;
      this.message = "";
    });
  }

  add(){
    this._chat.add(this.chatId, this.message, res => {
      console.log(res.message);
    });

    // Yeni mesajı Socket.IO üzerinden gönderin
    this.socket.emit('newMessage', { message: this.message });
    this.message = ""
  }

  getByChat() {
    let model = { _id: this.chatId };
    this._chat.getByChat(model, res => {
      this.chat = res;
      console.log(res); // res'i consoloda yazdır
    });
  }
}
