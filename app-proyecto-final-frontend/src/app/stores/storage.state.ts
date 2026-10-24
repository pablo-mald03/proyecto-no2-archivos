// Archivo nuevo: ej. src/app/core/services/storage-state.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, Observable, Subject, catchError, debounceTime, filter, fromEvent, switchMap } from 'rxjs';
import { API_URL } from '../core/config/api.config';
import { FileUploadQueueService } from '../features/files/service/file-upload-queue.service';
import { StorageLevel, StorageUsage } from '../features/storage/storage.model';



/** Shared state for the user logged storage. */
@Injectable({ providedIn: 'root' })
export class StorageState {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = inject(API_URL);
    private readonly uploadQueue = inject(FileUploadQueueService);

    private readonly _usage = signal<StorageUsage | null>(null);
    private readonly refresh$ = new Subject<void>();

    readonly usage = this._usage.asReadonly();
    readonly loading = signal(false);

    // Profile storage percent
    readonly percentage = computed(() => {
        const s = this._usage();
        if (!s || s.quotaBytes === 0) return 0;

        const rounded = Math.round((s.usedBytes / s.quotaBytes) * 10000) / 100;
        const visible = s.usedBytes > 0 ? Math.max(rounded, 0.01) : rounded;
        return Math.min(visible, 100);
    });

    readonly level = computed<StorageLevel>(() => {
        const p = this.percentage();
        if (p >= 100) return 'full';
        if (p >= 90) return 'warn';
        return 'ok';
    });

    constructor() {
        this.refresh$
            .pipe(
                debounceTime(400),
                switchMap(() => this.fetch()),
                takeUntilDestroyed()
            )
            .subscribe((usage) => this._usage.set(usage));

        this.uploadQueue.fileUploaded$
            .pipe(takeUntilDestroyed())
            .subscribe(() => this.refresh());

        fromEvent(document, 'visibilitychange')
            .pipe(
                filter(() => document.visibilityState === 'visible' && this._usage() !== null),
                takeUntilDestroyed()
            )
            .subscribe(() => this.refresh());
    }

    /** Initial data load. */
    ensureLoaded(): void {
        if (this._usage() !== null || this.loading()) return;

        this.loading.set(true);
        this.fetch().subscribe({
            next: (usage) => this._usage.set(usage),
            complete: () => this.loading.set(false),
        });
    }

    /** Request the refresh value for the user storage. */
    refresh(): void {
        this.refresh$.next();
    }

    /** Clear the user statestate. */
    reset(): void {
        this._usage.set(null);
        this.loading.set(false);
    }

    //Set the storage usage
    setUsage(usage: StorageUsage): void {
        this._usage.set(usage);
    }

    private fetch(): Observable<StorageUsage> {
        return this.http
            .get<StorageUsage>(`${this.apiUrl}/users/me/storage`)
            .pipe(catchError(() => EMPTY));
    }
}