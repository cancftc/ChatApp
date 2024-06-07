import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UserModel } from '../login/models/user.model';
import { GenericHttpService } from '../services/generic-http.services';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ChatService } from './services/chat.service';
import { ChatModel } from './models/chat.model';
import { ChatMessageModel } from './models/chatModel2';
import { io, Socket } from 'socket.io-client';
import { CommonModule } from '@angular/common';
import { AuthService } from '../login/services/auth.services';

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
  online: boolean = false;
  messageId: string = "";

  @ViewChild('chatContent') private chatContent!: ElementRef;

  constructor(
    private _auth: AuthService,
    private _http: GenericHttpService,
    private _chat: ChatService,
    private _router: Router
  ) { }

  ngOnInit(): void {
    this.getAll();
    this.socket = io('http://localhost:4000');

    const localUserString = localStorage.getItem("user");
    const localUser = localUserString ? JSON.parse(localUserString) : null;
    if (localUser) {
        this.socket.emit('userOnline', localUser._id);
    }

    this.socket.on('newMessage', (newMessage) => {
      this.chat.messages.push(newMessage);
      this.scrollToBottom();
    });

    this.socket.on('userStatusChange', (statusChange) => {
      const user = this.users.find(u => u._id === statusChange.userId);
      if (user) {
          user.online = statusChange.online;
      }
  });
  }

  ngAfterViewInit(): void {
    this.observeMutations();
  }

  exit(){
    const localUserString = localStorage.getItem("user");
    const localUser = localUserString ? JSON.parse(localUserString) : null;
    console.log(localUser._id);
    this.socket.emit('userOffline', localUser._id);
    this._auth.updateOnlineStatus(localUser._id, false, res => {
      console.log(localUser._id);
      console.log('false oldu');

    });
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    this._router.navigateByUrl("login");
  }

  getAll() {
    this._http.get<UserModel[]>("auth/getAll", res => {
      const localUserString = localStorage.getItem("user");
      const localUser = localUserString ? JSON.parse(localUserString) : null;
      
      const localUsername = localUser ? localUser.name : null;
  
      this.users = res.filter(user => user.name !== localUsername);
      this.users.forEach(user => {
        console.log(`User: ${user.name}, Online: ${user.online}`);
        this.online = user.online;
      });
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
      if (userString) {
        chat.online = true;
      } else {
        chat.online = false;
      }

      this._chat.create(chat, res => {
        console.log(res.message);
        this.chatId = res.message;
        this.message = "";
        resolve();
      });
    });
  }

  add() {
    if (!this.message.trim()) {
      return;
    }
    let userString = localStorage.getItem("user");
    let user = userString ? JSON.parse(userString) : null;
    this.messageUserId = user._id;

    this._chat.add(this.chatId, this.message, this.messageUserId, res => {
      console.log(res.message);
    });

    this.socket.emit('newMessage', { message: this.message, messageUserId: this.messageUserId, messageId: this.messageId });
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
    } else {
      backgroundColor = '#6d728b';
      float = 'left';
    }

    if (message.length < 5) {
      width = '10%';
      clear = 'both'; 
    } else if (message.length < 7) {
      width = '10%';
      clear = 'both'; 
    } else if (message.length < 10) {
      width = '12%';
      clear = 'both'; 
    } else if (message.length < 13) {
      width = '15%';
      clear = 'both'; 
    } else if (message.length < 15) {
      width = '18%';
      clear = 'both'; 
    } else if (message.length < 18) {
      width = '20%';
      clear = 'both'; 
    } else if (message.length < 35) {
      width = '25%';
      clear = 'both'; 
    } else if (message.length < 40) {
      width = '30%';
      clear = 'both'; 
    } else if (message.length < 45) {
      width = '35%';
      clear = 'both'; 
    } else if (message.length < 50) {
      width = '37%';
      clear = 'both'; 
    } else if (message.length < 55) {
      width = '40%';
      clear = 'both'; 
    } else if (message.length < 70) {
      width = '45%';
      clear = 'both'; 
    } else {
      width = '80%';
      clear = 'both'; 
    }

    return {
      'background-color': backgroundColor,
      'width': width,
      'float': float,
      'clear': clear,
      'height': 'auto',
    };
  }

  async vertical(messageId: string) {
    try {
      let model = { messageId: messageId, chatId: this.chatId };
      this.messageId = messageId;
      this._chat.removeMessage(model, async res => {
        console.log(res);
        const deletedMessageIndex = this.chat.messages.findIndex(msg => msg.messageId === messageId);
        if (deletedMessageIndex !== -1) {
          this.chat.messages.splice(deletedMessageIndex, 1);
        } else {
          console.error('Silinen mesajın indeksi bulunamadı');
        }
      });
    } catch (error) {
      console.error('Mesaj silinirken bir hata oluştu:', error);
    }
  }
}
