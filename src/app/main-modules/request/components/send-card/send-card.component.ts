import { Component, Input } from '@angular/core';
import { RequestService } from '../../request-service/request.service';
import * as Global from '../../../../../environments/environment'
@Component({
  selector: 'app-send-card',
  templateUrl: './send-card.component.html',
  styleUrls: ['./send-card.component.scss']
})
export class SendCardComponent {
  baseUrl = Global.environment.BASE_URL
  @Input() name:any
  public requestType:any = 0
  constructor(
    public requestService:RequestService
  ){}
  ngOnInit(){
    this.requestService.requestTypeSubject$.subscribe((res)=>{
      this.requestType = res
    })
  }
  withdrawReq(item:any){
    if(this.requestService.resourceType == 'plant'){
      this.requestService.cancelSitePlantRequest(item.spId)
    }else{
      this.requestService.cancelSiteUserRequest(item.suId)
    }
  }
  acceptReqest(item:any){
    if(this.requestService.resourceType == 'plant'){
      this.requestService.acceptSitePlant(item)
    }else{
      this.requestService.acceptSiteUser(item)
    }
  }
}
