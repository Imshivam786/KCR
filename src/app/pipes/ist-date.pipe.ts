// pipes/ist-date.pipe.ts
import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'istDate'
})
export class IstDatePipe implements PipeTransform {
  constructor(private datePipe: DatePipe) {}

  transform(value: Date | string | number, format: string = 'medium'): string | null {
    if (!value) {
      return null;
    }

    return this.datePipe.transform(value, format, '+0530', 'en-US');
  }
}
