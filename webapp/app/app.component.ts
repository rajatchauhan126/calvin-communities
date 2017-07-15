import { Component } from '@angular/core';
import { OverlayContainer } from '@angular/material';

@Component({
  selector: 'calvin-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

navigation = [
    { link: 'dashboard', label: 'Dashboard' },
    { link: 'trending', label: 'Trending Communities' },
    {link: 'communities', label:'Communities'},
    { link: 'templates', label: 'Templates' },
    { link: 'tools', label: ' Tools' },
    { link: 'search', label: 'Search'},
    { link: 'templatelist', label: 'TemplateList'},
    { link: 'purpose', label: 'Purpose'},
  ];
}
