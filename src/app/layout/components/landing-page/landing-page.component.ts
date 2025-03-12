import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RequestDemoModel } from 'src/app/core/model/admin-model';
import { CommonService } from 'src/app/core/services/common.service';
import { EndUserService } from 'src/app/core/services/end-user.service';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent {
  public aboutCard = [
    {
      img:'ConstructionHomePage.png',
      title:'Construction'
    },
    {
      img:'Hospitality.png',
      title:'Helthcare'
    },
    {
      img:'LogisticsImg.png',
      title:'Logistics'
    },
    {
      img:'Resources.png',
      title:'Resources'
    },
  ]
  benefits = [
    {
      image: 'assets/images/Gain Full-Visibility.png',
      alt: 'Gain Full Visibility',
      title: 'Gain Full Visibility',
      description: 'Always know where your resources are and what skilled resources you have available.'
    },
    {
      image: 'assets/images/Ensure-Compliance.png',
      alt: 'Ensure Compliance',
      title: 'Ensure Compliance',
      description: 'Stay compliant with industry regulation and internal policies, reducing the risk of workplace incidents and investigations.'
    },
    {
      image: 'assets/images/Optimize-Performance.png',
      alt: 'Optimise Performance',
      title: 'Optimise Performance',
      description: 'Reduce downtime and administrative costs to identify appropriate resources and check qualifications.'
    },
    {
      image: 'assets/images/Increase-Utilization.png',
      alt: 'Increase Utilisation',
      title: 'Increase Utilisation',
      description: 'Redeploy under-utilised company resources rather than incurring external hire costs.'
    },
    {
      image: 'assets/images/Enhance-Collaboration.png',
      alt: 'Enhance Collaboration',
      title: 'Enhance Collaboration',
      description: 'Provide the tools your team needs to work together effectively.'
    }
  ];
  industries = [
    {
      name: 'Construction',
      image: 'assets/images/Construction.png',
    },
    {
      name: 'Logistics',
      image: 'assets/images/Logistics.png',
    },
    {
      name: 'Maintenance',
      image: 'assets/images/Maintainence.png',
    },
    {
      name: 'Labour Supply',
      image: 'assets/images/Labour Supply.png',
    },
    {
      name: 'Support Services',
      image: 'assets/images/Support Services.png',
    }
  ];
  activeSection: string = '';
  requestDemoForm: FormGroup|any;
  constructor(
    private fb: FormBuilder,
    public endUserService:EndUserService,
    public commonService:CommonService,
  ) {}
  ngOnInit(): void {
    this.requestDemoForm = this.fb.group({
      name: ['', [Validators.required]],
      phone: ['', ],
      email: ['', [Validators.required,this.commonService.noWhitespace,Validators.email]],
      companyName: [''],
      comment: ['', [Validators.required]]
    });
  }
  onSubmit(): void {
    let requestDemoModel = new RequestDemoModel()
    requestDemoModel.rdCompanyName = this.requestDemoForm.value.companyName
    requestDemoModel.rdName = this.requestDemoForm.value.name
    requestDemoModel.rdEmail = this.requestDemoForm.value.email
    requestDemoModel.rdPhone = this.requestDemoForm.value.phone
    requestDemoModel.rdComment = this.requestDemoForm.value.comment

      this.endUserService.requestDemo(requestDemoModel).subscribe((result:any)=>{
        if (result.status == 200){
          this.commonService.successAlert(result.message)
          this.requestDemoForm.reset();
        }else{
          this.commonService.ApiErrAlert(result)
        }
      })
  }
  getErrorMessage(type:any) {
		switch (type) {
      case "name":
				return this.requestDemoForm.get('name').hasError('required') ?  'Name is required' : '';
      case "mail":
        return this.requestDemoForm.get('email').hasError('required') || this.requestDemoForm.get('email').hasError('whitespace') ?  'Email is required' : this.requestDemoForm.get('email').hasError('email') ? 'Please Enter Valid Mail' : '';
      case "comment":
        return this.requestDemoForm.get('comment').hasError('required') ?  'Comment is required' : '';
      default:
        return '';
		}
	}
  scrollTo(sectionId: string): void {
    const section = document.getElementById(sectionId);
  if (section) {
    const offset = 75; // Navbar height
    const elementPosition = section.getBoundingClientRect().top + window.scrollY - offset;

    window.scrollTo({ top: elementPosition, behavior: 'smooth' });
    this.activeSection = sectionId;
  }
  }

  @HostListener('window:scroll', [])
  onScroll(): void {
    const sections = document.querySelectorAll('section');
    let scrollPos = window.scrollY;
    const documentHeight = document.documentElement.scrollHeight;
    const windowHeight = window.innerHeight;
    if (scrollPos + windowHeight >= documentHeight) {
      this.activeSection = 'requestDemo'; // Set active section to REQUEST DEMO
      return; // Exit early to avoid checking sections
    }
    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 80; // Adjust for navbar height
      const sectionBottom = sectionTop + section.offsetHeight;
      if (scrollPos >= sectionTop && scrollPos < sectionBottom) {
          this.activeSection = section.id;
      }
    });
  }
}
