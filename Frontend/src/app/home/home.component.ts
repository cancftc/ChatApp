import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UserModel } from '../login/models/user.model';
import { GenericHttpService } from '../services/generic-http.services';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ChatService } from './services/chat.service';
import { ChatModel } from './models/chat.model';
import { ChatModel2 } from './models/chatModel2';
import { io, Socket } from 'socket.io-client';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, AfterViewInit {
  users: UserModel[] = [];
  selectedUser: UserModel = new UserModel();
  message: string = "";
  chatId: string = "";
  chat: ChatModel2 = new ChatModel2();
  socket!: Socket;

  @ViewChild('chatContent') private chatContent!: ElementRef;

  constructor(
    private _http: GenericHttpService,
    private _chat: ChatService
  ) { }

  ngOnInit(): void {
    this.getAll();
    this.socket = io('http://localhost:4000');

    // Yeni mesajları dinleyin
    this.socket.on('newMessage', (newMessage) => {
      this.chat.messages.push(newMessage);
      this.scrollToBottom();
    });
  }

  ngAfterViewInit(): void {
    this.observeMutations();
  }

  getAll() {
    this._http.get<UserModel[]>("auth/getAll", res => this.users = res);
  }

  async changeUser(user: UserModel) {
    this.selectedUser = user;
    await this.crate();
    if (this.chatId) {
      this.getByChat();
    }
  }

  crate(): Promise<void> {
    return new Promise((resolve, reject) => {
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
        resolve();
      });
    });
  }

  add() {
    this._chat.add(this.chatId, this.message, res => {
      console.log(res.message);
    });

    this.socket.emit('newMessage', { message: this.message });
    this.message = "";
  }

  getByChat() {
    let model = { _id: this.chatId };
    this._chat.getByChat(model, res => {
      this.chat = res;
      console.log(res);
    });
  }

  private scrollToBottom(): void {
    try {
      this.chatContent.nativeElement.scrollTop = this.chatContent.nativeElement.scrollHeight;
    } catch(err) {
      console.log('Scroll to bottom failed:', err);
    }
  }

  private observeMutations(): void {
    const config = { childList: true };
    const targetNode = this.chatContent.nativeElement;

    const callback = (mutationsList: MutationRecord[], observer: MutationObserver) => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
          this.scrollToBottom();
        }
      }
    };

    const observer = new MutationObserver(callback);
    observer.observe(targetNode, config);
  }
}
