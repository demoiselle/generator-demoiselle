import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Observer } from "rxjs/Observer";
import { environment } from '../../environments/environment';

@Injectable()
export class WebSocketService {
  private subject: Subject<any>;

  // For chat box
  public connect(): Promise<Subject<any>> {
    const url = environment.socketUrl;
    if (this.subject) {
      return Promise.resolve(this.subject);
    }

    return new Promise((resolve, reject) => {
      const support = window && 'WebSocket' in window;
      if (!support) {
        return reject('Not support for WebSocket.');
      }
      const ws = new WebSocket(url);
      const observable = Observable.create(
        (obs: Observer<any>) => {
          ws.onmessage = obs.next.bind(obs);
          ws.onerror = obs.error.bind(obs);
          ws.onclose = () => {
            console.log('[ws] closed.');
            obs.complete();
          };

          return ws.close.bind(ws);
        });

      const observer = {
        next: (data: Object) => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(data));
            console.debug('[ws] data sent:', data);
          } else {
            console.warn('WebSocket is not OPEN.');
          }
        }
      };

      this.subject = Subject.create(observer, observable);
      ws.onopen = (event) => {
        console.log('[ws] opened.');
        resolve(this.subject);
      };
    });
  }

  public send(data) {
    if (!this.subject) {
      throw new Error('You are not connected.');
    }

    this.subject.next(data);
  }
}
