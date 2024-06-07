import { Component } from '@angular/core';
import { LoaderService } from 'src/app/core/services/loader.service';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent {
  public showLoader:boolean = false
  constructor(public loaderService:LoaderService){}

  ngOnInit(){
    this.loaderService.loaderState.subscribe((state:boolean)=>{
      this.showLoader = state
    })
  }
}
