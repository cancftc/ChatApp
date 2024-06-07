import { Injectable } from '@angular/core';
import { LoginModel } from '../models/login.model';
import { HttpClient } from '@angular/common/http';
import { LoginResponseModel } from '../models/login-response.model';
import { GenericHttpService } from '../../services/generic-http.services';
import { RegisterModel } from '../models/register.module';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private _http: GenericHttpService
  ) { }

  login(model: LoginModel, callBack: (res:LoginResponseModel) => void){
    this._http.post<LoginResponseModel>("auth/login",model,res=> callBack(res));
  }
  register(model: FormData, callBack: (res:LoginResponseModel) => void){
    this._http.post<LoginResponseModel>("auth/register",model,res=> callBack(res));
  }

  updateOnlineStatus(userId: string, online: boolean, callback: (res: any) => void) {
    const data = { userId, online };
    this._http.post("auth/updateOnlineStatus", data, res => callback(res));
  }
}
