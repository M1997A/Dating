import { Component, OnInit, ViewChild, HostListener, Input, Output, EventEmitter } from '@angular/core';
import { UserService } from 'src/app/_services/user.service';
import { ActivatedRoute } from '@angular/router';
import { AlertifyService } from 'src/app/_services/alertify.service';
import { AuthService } from 'src/app/_services/auth.service';
import { Photo } from 'src/app/_models/photo';
import { FileUploader } from 'ng2-file-upload';
import { environment } from 'src/environments/environment';
import { error } from 'protractor';


@Component({
  selector: "app-photo-editor",
  styleUrls: ["photo-editor.component.css"],
  templateUrl: "photo-editor.component.html"
})
export class PhotoEditorComponent implements OnInit {
    
  @Input() photos: Photo[];
  @Output() getMemberPhotoChange = new EventEmitter<string>();
  uploader: FileUploader;
  hasBaseDropZoneOver: boolean = false;
  baseUrl = environment.apiUrl;
  current: Photo;
  ngOnInit(): void {
    this.initializeUploader();
  }
  constructor(private authService: AuthService, private userService: UserService, private alertify: AlertifyService) { }

  public fileOverBase(e: any): void {
    this.hasBaseDropZoneOver = e;
  }
  initializeUploader() {
      this.uploader = new FileUploader({
          url: this.baseUrl + 'users/' +  this.authService.decodedToken.nameid + '/photos',
          authToken: 'Bearer ' + localStorage.getItem('token'),
          isHTML5: true,
          allowedFileType: ['image'],
          removeAfterUpload: true,
          autoUpload: false,
          maxFileSize: 10 * 1024 * 1024
      });
      this.uploader.onAfterAddingFile = (file) => { file.withCredentials = false; };
      this.uploader.onSuccessItem = (item, response, status, headers) => {
        if(response)
        {
          const res: Photo = JSON.parse(response);
          const photo = {
            id: res.id,
            url: res.url,
            dateAdded: res.dateAdded,
            description: res.description,
            isMain: res.isMain
          };
          this.photos.push(photo);
          if(photo.isMain)
          {
            this.authService.changeMemberPhoto(photo.url);
            this.authService.currentUser.photoUrl = photo.url;
            localStorage.setItem('user', JSON.stringify(this.authService.currentUser));
          }
        }
        if(headers)
        {
          console.log(headers);
        }
      }
  }
  setMainPhoto(photo: Photo)
  {
    this.userService.setMainPhoto(this.authService.decodedToken.nameid, photo.id).subscribe(() => {
      this.current = this.photos.filter(p => p.isMain === true)[0];
      this.current.isMain = false;
      photo.isMain = true;
      this.getMemberPhotoChange.emit(photo.url);
      this.authService.changeMemberPhoto(photo.url);
      this.authService.currentUser.photoUrl = photo.url;
      localStorage.setItem('user', JSON.stringify(this.authService.currentUser));
    }, error => {
      this.alertify.errror(error);
    })
  }
  deletePhoto(id: number)
  {
    this.alertify.confirm('Are you sure you want to delete this photo', () => {
      this.userService.deletePhoto(this.authService.decodedToken.nameid, id).subscribe(() => {
        this.photos.splice(this.photos.findIndex(p => p.id === id),1);
        this.alertify.success('Photo has been deleted');
      }, error => {
        this.alertify.errror('Failed to delete the photo');
      });
    });
  }
}