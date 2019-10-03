import { Component } from '@angular/core';

@Component({
  selector: 'ngx-footer',
  styleUrls: ['./footer.component.scss'],
  template: `
    <span class="created-by">
      Powered by <b><a href="https://iot.bzh/" target="_blank">Iot.Bzh</a></b> 2021
    </span>
  `,
})
export class FooterComponent {
}
