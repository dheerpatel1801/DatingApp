import { ToastrService } from 'ngx-toastr';
import { take } from 'rxjs/operators';
import { AccountService } from './../../_services/accountservice';
import { MembersService } from './../../_services/members.service';
import { User } from './../../_models/user';
import { Member } from './../../_models/member';
import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-member-edit',
  templateUrl: './member-edit.component.html',
  styleUrls: ['./member-edit.component.css']
})
export class MemberEditComponent implements OnInit {
  @ViewChild('editForm') editForm: NgForm;
  member: Member;
  user: User;
  @HostListener('window:beforeunload', ['$event']) unloadNotification($event: any){
    if(this.editForm.dirty){
      $event.returnValue = true;
    }
  }

  constructor(private memberService: MembersService, private accountService: AccountService,
    private toastr: ToastrService ) {
      this.accountService.currentuser$.pipe(take(1)).subscribe(user => this.user = user);
   }

  ngOnInit(): void {
    this.loadmember();
  }

  loadmember() {
    this.memberService.getMember(this.user.username).subscribe(member => {
      this.member = member;
    })
  }
  updateMember() {
    this.memberService.updateMember(this.member).subscribe(() => {
      this.toastr.success('Profile updated successfully');
      this.editForm.reset(this.member);
    })
  }
}
