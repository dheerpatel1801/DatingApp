import { User } from 'src/app/_models/user';
import { AccountService } from './accountservice';
import { UserParams } from './../_models/userParams';
import { PaginatedResult } from './../_models/pagination';
import { map, take } from 'rxjs/operators';
import { Member } from './../_models/member';
import { environment } from './../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of, pipe } from 'rxjs';
import { getPaginatedResult, getPaginationHeaders } from './paginationHelper';

@Injectable({
  providedIn: 'root'
})
export class MembersService {
  baseUrl = environment.apiUrl;
  members: Member[] = [];
  memberCache = new Map();
  user: User;
  userParams: UserParams;

  constructor(private http: HttpClient, private accountService: AccountService) {
    this.accountService.currentuser$.pipe(take(1)).subscribe(user => {
      this.user = user;
      this.userParams = new UserParams(user);
    })
   }

   getUserParams() {
     return this.userParams;
   }

   setUserParams(params: UserParams) {
     this.userParams = params;
   }

   resetUserParams() {
     this.userParams = new UserParams(this.user);
     return this.userParams;
   }

  getMembers(userparams: UserParams){
    var response = this.memberCache.get(Object.values(userparams).join('-'));
    if(response) {
      return of(response);
    }
    let params = getPaginationHeaders(userparams.pageNumber, userparams.pageSize);

    params = params.append('minAge', userparams.minAge.toString());
    params = params.append('maxAge', userparams.maxAge.toString());
    params = params.append('gender', userparams.gender);
    params = params.append('orderBy', userparams.orderBy);

    return getPaginatedResult<Member[]>(this.baseUrl + 'users', params, this.http)
    .pipe(map(response => {
      this.memberCache.set(Object.values(userparams).join('-'), response);
      return response;
    }))
  }

  getMember(username: string){
    const member =  [...this.memberCache.values()]
    .reduce((arr, elem) => arr.concat(elem.result), [])
    .find((member: Member) => member.username === username);
    if(member) {
      return of(member);
    }
    return this.http.get<Member>(this.baseUrl + 'users/' + username);
  }
  updateMember(member: Member){
    return this.http.put(this.baseUrl+ 'users', member).pipe(
      map(() => {
        const index = this.members.indexOf(member);
        this.members[index] = member;
      })
    )
  }

  setMainPhoto(photoId: number) {
    return this.http.put(this.baseUrl + 'users/set-main-photo/' + photoId, {});
  }
  
  deletePhoto(photoId: number) {
    return this.http.delete(this.baseUrl + 'users/delete-photo/' + photoId);
  }

}
