import { HttpEventType } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { KcrService } from '../../services/kcr.service';

export interface Case {
  case_id: string;
  created_at: string;
  image_count: number;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  cases: Case[] = [];
  loading = false;
  uploading = false;
  uploadProgress = 0;
  
  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;
  Math = Math;

  constructor(
    private kcr: KcrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCases();
  }

  loadCases() {
    this.loading = true;
    this.kcr.getCases(this.currentPage, this.pageSize).subscribe({
      next: response => {
        this.cases = response.cases;
        this.totalItems = response.total;
        this.totalPages = Math.ceil(this.totalItems / this.pageSize);
        this.loading = false;
      },
      error: err => {
        console.error('Failed to load cases', err);
        this.loading = false;
      }
    });
  }

  refreshCases() {
    this.currentPage = 1;
    this.loadCases();
  }

  onFileSelected(ev: any) {
    const file: File = ev.target.files && ev.target.files[0];
    if (!file) return;
    
    this.uploading = true;
    this.uploadProgress = 0;

    // Upload file - this will create a new case
    this.kcr.uploadToNewCase(file).subscribe({
      next: event => {
        if (event.type === HttpEventType.UploadProgress) {
          this.uploadProgress = Math.round((100 * (event.loaded || 0)) / (event.total || 1));
        } else if (event.type === HttpEventType.Response) {
          this.uploading = false;
          this.uploadProgress = 100;
          
          const body: any = event.body;
          if (body && body.case_id) {
            // Navigate to the newly created case
            setTimeout(() => {
              this.router.navigate(['/case', body.case_id]);
            }, 500);
          } else {
            this.refreshCases();
          }
        }
      },
      error: err => {
        console.error('Upload failed', err);
        this.uploading = false;
        this.uploadProgress = 0;
      }
    });

    ev.target.value = '';
  }

  deleteCase(caseId: string) {
    if (!confirm('Delete this case and all its images?')) return;
    
    this.kcr.deleteCase(caseId).subscribe({
      next: () => {
        this.loadCases();
      },
      error: err => console.error('Delete failed', err)
    });
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadCases();
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);
    
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }
}
