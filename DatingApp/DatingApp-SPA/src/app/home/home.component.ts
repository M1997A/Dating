import { Component } from "@angular/core";

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html'
})

export class HomeComponent {
    registerMode = false;

    registerToggle(){
        this.registerMode = true;
    }
    cancelRegisterMode(registerMode: boolean){
        this.registerMode = registerMode;
    }
}