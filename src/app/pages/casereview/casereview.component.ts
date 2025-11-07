import { HttpEventType } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { KcrService } from '../../services/kcr.service';


export interface ImageItem {
  image_id: string;
  filename: string;
  uploaded_at: string;
  analyzed_at?: string;
  ocr_result?: any;
}

@Component({
  selector: 'app-casereview',
  templateUrl: './casereview.component.html',
  styleUrl: './casereview.component.scss'
})
export class CasereviewComponent {
  caseId: string = '';
  imagesList: ImageItem[] = [];
  selectedImage: ImageItem | null = null;
  uploading = false;
  uploadProgress = 0;
  backendBase = 'http://localhost:8000';
  processing: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private kcr: KcrService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.caseId = params['caseId'];
      if (this.caseId) {
        this.refreshList();
      }
    });
  }

  refreshList() {
    this.kcr.getCaseImages(this.caseId).subscribe({
      next: (images: any[]) => {
        this.imagesList = images;
        
        // Auto-select first image if none selected
        if (!this.selectedImage && images.length > 0) {
          this.selectedImage = images[0];
        } else if (this.selectedImage) {
          // Update selected image with latest data
          const updated = images.find(img => img.image_id === this.selectedImage?.image_id);
          if (updated) {
            this.selectedImage = updated;
          }
        }
      },
      error: err => {
        console.error('Failed to load images', err);
        if (err.status === 404) {
          alert('Case not found');
          this.router.navigate(['/']);
        }
      }
    });
  }

  selectImage(image: ImageItem) {
    this.selectedImage = image;
  }

  onFileSelected(ev: any) {
    const file: File = ev.target.files && ev.target.files[0];
    if (!file) return;
    
    this.uploading = true;
    this.uploadProgress = 0;

    this.kcr.uploadToCase(this.caseId, file).subscribe({
      next: event => {
        if (event.type === HttpEventType.UploadProgress) {
          this.uploadProgress = Math.round((100 * (event.loaded || 0)) / (event.total || 1));
        } else if (event.type === HttpEventType.Response) {
          this.uploading = false;
          this.uploadProgress = 100;
          
          const body: any = event.body;
          this.refreshList();
          
          // Auto-select newly uploaded image
          if (body && body.image_id) {
            setTimeout(() => {
              const newImage = this.imagesList.find(img => img.image_id === body.image_id);
              if (newImage) this.selectImage(newImage);
            }, 300);
          }
        }
      },
      error: err => {
        console.error('Upload failed', err);
        this.uploading = false;
        this.uploadProgress = 0;
      }
    });

    // Reset file input
    ev.target.value = '';
  }

  deleteImage(imageId: string) {
    if (!confirm('Delete this image?')) return;
    
    this.kcr.deleteImage(this.caseId, imageId).subscribe({
      next: () => {
        if (this.selectedImage?.image_id === imageId) {
          this.selectedImage = null;
        }
        this.refreshList();
      },
      error: err => console.error('Delete failed', err)
    });
  }

  doWordAnalyse() {
    if (!this.selectedImage) return;
    
    const tuned = {};
    this.processing = true;

    this.kcr.analyzeImage(this.caseId, this.selectedImage.image_id, tuned)
      .pipe(finalize(() => { this.processing = false; }))
      .subscribe({
        next: (data) => {
          console.log('Analysis complete', data);
          // Refresh to get updated OCR results
          this.refreshList();
        },
        error: err => {
          console.error('Word analyse error', err);
          alert('Failed to analyze image');
        }
      });
  }

  getImageUrl(imageId: string): string {
    return `${this.backendBase}/cases/${this.caseId}/images/${imageId}/file`;
  }

  getAverageConfidence(regions: any[]): number {
    if (!regions || regions.length === 0) return 0;
    const sum = regions.reduce((acc, r) => acc + (r.region_confidence || 0), 0);
    return sum / regions.length;
  }
}
