import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UserModel } from '../login/models/user.model';
import { GenericHttpService } from '../services/generic-http.services';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ChatService } from './services/chat.service';
import { ChatModel } from './models/chat.model';
import { ChatMessageModel } from './models/chatModel2';
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
  chat:  ChatMessageModel= new ChatMessageModel();
  socket!: Socket;
  messageUserId: string = "";

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
    this._http.get<UserModel[]>("auth/getAll", res => {
      const localUserString = localStorage.getItem("user");
      const localUser = localUserString ? JSON.parse(localUserString) : null;
      
      // Localdeki kullanıcı adını al
      const localUsername = localUser ? localUser.name : null;
  
      // Gelen kullanıcıları filtrele
      this.users = res.filter(user => user.name !== localUsername);
    });
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
      this.messageUserId = user._id;

      let chat = new ChatModel();
      chat.userId = user._id;
      chat.toUserId = this.selectedUser._id;

      this._chat.create(chat, res => {
        console.log(res.message);
        this.chatId = res.message;
        this.message = "";
        resolve();
      });
    });
  }

  add() {
    let userString = localStorage.getItem("user");
    let user = userString ? JSON.parse(userString) : null;
    this.messageUserId = user._id;

    this._chat.add(this.chatId, this.message, this.messageUserId, res => {
      console.log(res.message);
    });

    this.socket.emit('newMessage', { message: this.message, messageUserId: this.messageUserId });
    this.message = "";
  }

  getByChat() {
    let model = { _id: this.chatId };
    this._chat.getByChat(model, res => {
      this.chat = res;
      console.log(res);
    });
  }
  
  scrollToBottom(): void {
      this.chatContent.nativeElement.scrollTop = this.chatContent.nativeElement.scrollHeight;
  }
  
  observeMutations(): void {
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

  getMessageStyle(message: string, messageUserId: string): any {
    let backgroundColor: string;
    let width: string;
    let float: string;
    let clear: string = 'none';

    if (messageUserId === this.messageUserId) {
      backgroundColor = '#7388f0';
      float = 'right'; 
      // LocalStorage'daki kullanıcı için beyaz
    } else {
      backgroundColor = '#6d728b'; // Diğer kullanıcılar için
      float = 'left';
    }

    if (message.length < 20) {
      width = '35%';
      clear = 'both'; 
    } else if (message.length < 50) {
      width = '40%';
    } else if (message.length < 60) {
      width = '60%';
    } else {
      width = '80%';
    }

    return {
      'background-color': backgroundColor,
      'width': width,
      'float': float,
      'clear': clear,
      'height': 'auto', // Yükseklik içeriğe göre otomatik ayarlanacak
    };
  }
}
