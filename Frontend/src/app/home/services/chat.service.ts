import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GenericHttpService } from '../../services/generic-http.services';
import { ChatModel } from '../models/chat.model';
import { MessageResponseModel } from '../models/message.response';
import { ChatMessageModel } from '../models/chatModel2';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(
    private _http: GenericHttpService
  ) { }

  create(model: ChatModel, callBack:(res: MessageResponseModel)=> void){
    this._http.post<MessageResponseModel>("chat/create", model, res=>{
        callBack(res);
    })
  }

  add(chatId: string, message: string, messageUserId: string, callBack:(res: MessageResponseModel)=> void){
    const model = {chatId : chatId, message: message, messageUserId: messageUserId};
    this._http.post<MessageResponseModel>("chat/add", model, res=>{
        callBack(res);
    })
  }

  getByChat(model: any, callBack:(res: ChatMessageModel)=> void){
    this._http.post<ChatMessageModel>("chat/getByChat", model, res=>{
        callBack(res);
    })
  }
}
