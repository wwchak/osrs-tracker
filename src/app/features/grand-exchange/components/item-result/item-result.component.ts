import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { NavController, IonItemSliding } from '@ionic/angular';
import { AppRoute } from 'app-routing.routes';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import { ItemProvider } from 'services/item/item';
import { getTrendClass, ItemSearchModel } from 'services/item/item.model';
import { StorageKey } from 'services/storage/storage-key';
import { StorageService } from 'services/storage/storage.service';
import { GrandExchangeRoute } from '../../grand-exchange.routes';

@Component({
  selector: 'item-result',
  templateUrl: './item-result.component.html',
  styleUrls: ['./item-result.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemResultComponent implements OnInit {

  @Input() itemId: string = null;
  @Input() item: ItemSearchModel = null;
  @Input() slide = false;

  @Output() update: EventEmitter<void> = new EventEmitter<void>();

  loading = true;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private itemService: ItemProvider,
    private storageService: StorageService,
    private navCtrl: NavController
  ) { }

  async ngOnInit() {
    if (this.itemId && !this.item) {
      this.item = await this.storageService.getValue<ItemSearchModel>(StorageKey.CacheItems, <ItemSearchModel>{})
        .then(items => items[this.itemId] || ItemSearchModel.empty());
      this.getData().subscribe();
    } else {
      this.loading = false;
    }
  }

  getData(): Observable<ItemSearchModel> {
    this.loading = true;
    this.changeDetectorRef.markForCheck();
    return this.itemService.getItem(+this.itemId).pipe(
      finalize(() => {
        this.loading = false;
        this.changeDetectorRef.markForCheck();
      }),
      tap(item => {
        this.item = item;
        this.item.trendClass = getTrendClass(this.item.today);
        this.item.icon = `${environment.API_GEPT}/icon/${this.item.id}`;
      })
    );
  }

  goToDetails(): void {
    this.navCtrl.navigateForward([AppRoute.GrandExchange, GrandExchangeRoute.ItemDetails, this.item.id]);
  }

  async deleteItem(): Promise<void> {
    await this.storageService.removeFromArray(StorageKey.FavoriteItems, this.item.id.toString());
    await this.storageService.removeFromArray(StorageKey.RecentItems, this.item.id.toString());
    this.update.emit();
  }

}
