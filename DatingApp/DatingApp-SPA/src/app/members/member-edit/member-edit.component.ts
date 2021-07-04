import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { UserService } from 'src/app/_services/user.service';
import { ActivatedRoute } from '@angular/router';
import { AlertifyService } from 'src/app/_services/alertify.service';
import { User } from 'src/app/_models/user';
import { NgForm } from '@angular/forms';
import { AuthService } from 'src/app/_services/auth.service';


@Component({
    selector: 'app-member-edit',
    styleUrls: ['member-edit.component.css'],
    templateUrl: 'member-edit.component.html'
})

export class MemberEditComponent implements OnInit {
    user: User;
    photoUrl: string;
    @ViewChild('editForm', {static: true}) editForm : NgForm;
    @HostListener('window:beforeunload', ['$event'])
    unloadNotification($event: any){
        if(this.editForm.dirty)
        $event.returnValue = true;
    }
    constructor(private userService: UserService, private route: ActivatedRoute, 
        private alertify: AlertifyService, private authSerivce: AuthService) { }

    ngOnInit() {
        this.route.data.subscribe(data => {
            this.user = data['user'];
        });
        this.authSerivce.currentPhotoUrl.subscribe(photoUrl => this.photoUrl = photoUrl);
     }
     updateUser()
     {
         this.userService.updateUser(this.authSerivce.decodedToken.nameid, this.user).subscribe(next => {
            this.alertify.success("Profile updated successfully");
            this.editForm.reset(this.user);
         },error => {
             this.alertify.errror(error);
         });
         
     }
     updateMainPhoto(url: string)
     {
         this.user.photoUrl = url;
     }
}