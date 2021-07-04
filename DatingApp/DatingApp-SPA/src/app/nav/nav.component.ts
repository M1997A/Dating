import { Component, OnInit } from "@angular/core";
import { AuthService } from '../_services/auth.service';
import { AlertifyService } from '../_services/alertify.service';
import { Router } from '@angular/router';
//import { JwtHelperService } from '@auth0/angular-jwt';

@Component({
    selector: 'app-nav',
    styleUrls:['./nav.component.css'],
    templateUrl: './nav.component.html'
})

export class NavComponent {
    model: any = {};
    photoUrl: string;
    //jwtHelper = new JwtHelperService();
    constructor(private authService: AuthService, private alertify: AlertifyService,
         private router: Router){}
    ngOnInit()
    {
       this.authService.currentPhotoUrl.subscribe(photoUrl => this.photoUrl = photoUrl);
    }
    login(){
        this.authService.login(this.model).subscribe(next =>{
            //console.log(next);
            this.alertify.success("logged in successfully");
            
        }, error => {
            this.alertify.errror(error);
        },() => {
            this.router.navigate(['/members']);
        })
    }
    loggedIn(){
       return this.authService.loggedIn();
    }
    logout(){
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.authService.decodedToken = null;
        this.authService.currentUser = null;
        this.alertify.message('logged out');
        this.router.navigate(['/home']);
    }
}