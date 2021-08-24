import { User } from 'src/app/classes/user';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  constructor() { }
/**
 * Encrypt and send userData to localStorageUser
 * @param {User} userData
 */

  setUser(userData:User){
    const userString = JSON.stringify(userData)
    const encryrptedUserString = window.btoa(unescape(encodeURIComponent(userString)))
    localStorage.setItem('user',encryrptedUserString)
    console.log('encryption succesful');

  }

  /**
   * fetch encryptedUserData from localStorageUser and returns userData as User
   * @returns {User} user
   */
  getUser(){
    const encryptedUserString = localStorage.getItem('user')
    if ( encryptedUserString == null){
      return
    }
    const userString = decodeURIComponent(escape(window.atob(encryptedUserString)))
    const user = JSON.parse(userString)
    return new User(user || '[]')
  }
}
