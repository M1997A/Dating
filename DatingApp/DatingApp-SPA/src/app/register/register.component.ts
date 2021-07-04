import { Component, Input, Output, EventEmitter, OnInit } from "@angular/core";
import { AuthService } from '../_services/auth.service';
import { AlertifyService } from '../_services/alertify.service';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { BsDatepickerConfig } from 'ngx-bootstrap';
import { User } from '../_models/user';
import { Router } from '@angular/router';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html'
})

export class RegisterComponent implements OnInit {
    
    @Input() valuesFromHome: any;
    @Output() cancelRegister = new EventEmitter();

    user: User;
    registerForm: FormGroup;
    bsConfig: Partial<BsDatepickerConfig>;
    constructor(private authService: AuthService, private alertify: AlertifyService, 
      private fb: FormBuilder, private route: Router){}
    
    ngOnInit(): void {
        this.bsConfig = {
            containerClass: 'theme-red'
        }
        this.createRegisterForm();
    }
    createRegisterForm() {
        this.registerForm = this.fb.group({
            gender: ['male'],
            username: ['', Validators.required],
            knownAs: ['', Validators.required],
            dateOfBirth: [null, Validators.required],
            city: ['', Validators.required],
            country: ['', Validators.required],
            password: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(8)]],
            confirmPassword: ['', Validators.required]
        },{ validator: this.passwordMatchValidator});
    }
    getValidationMessages(fc: FormControl, label: string): string[]
    {
        
        let messages: string[] = [];
        if(fc.errors)
        {
            for(let errorName in fc.errors)
            {
                switch (errorName) {
                  case "required":
                    messages.push(`You must enter a ${label}`);
                    break;
                  case "minlength":
                    messages.push(
                      `A ${label} must be at least ${fc.errors["minlength"].requiredLength} characters`
                    );
                    break;
                  case "maxlength":
                    messages.push(
                      `A ${label} must be no more than ${fc.errors["maxlength"].requiredLength} characters`
                    );
                    break;
                  case "pattern":
                    messages.push(`The ${label} contains illegal characters`);
                    break;
                  case "mismatch":
                      messages.push("Passwords must match");
                      break;
                }
            }
        }
        return messages;
    }
    passwordMatchValidator(g: FormGroup)
    {
        return g.get('password').value === g.get('confirmPassword').value ? null : g.get('confirmPassword').setErrors({'mismatch': true}); 
    }
    register(){
        if(this.registerForm.valid)
        {
          this.user = Object.assign({}, this.registerForm.value);
          this.authService.register(this.user).subscribe(() => {
            this.alertify.success("Registrations Successful");
          }, error => {
            this.alertify.errror(error);
          }, () => {
            this.authService.login(this.user).subscribe(() =>{
              this.route.navigate(['/members']);
            });
          });
        }
       
    }
    cancel(){
        this.cancelRegister.emit(false);
        //console.log("canceld");
    }
}