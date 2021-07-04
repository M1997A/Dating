import { Component, OnInit, Input } from '@angular/core';
import { User } from 'src/app/_models/user';
import { UserService } from 'src/app/_services/user.service';
import { AuthService } from 'src/app/_services/auth.service';
import { AlertifyService } from 'src/app/_services/alertify.service';

@Component({
    selector: 'app-member-card',
    styleUrls:['member-card.component.css'],
    templateUrl: 'member-card.component.html'
})

export class MemberCardComponent implements OnInit {
    @Input() user: User; 
    constructor(private userService: UserService, private authService: AuthService, private alertify: AlertifyService) { }

    ngOnInit() { }

    sendLike(id: number)
    {
        this.userService.sendLike(this.authService.decodedToken.nameid, id).subscribe(data => {
            this.alertify.success('You have liked : ' + this.user.knownAs);
        }, error => {
            this.alertify.errror(error);
        })
    }
}