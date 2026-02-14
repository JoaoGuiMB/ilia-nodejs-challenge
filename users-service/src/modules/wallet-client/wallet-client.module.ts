import { Module } from '@nestjs/common';
import { WalletClientService } from './wallet-client.service';

@Module({
  providers: [WalletClientService],
  exports: [WalletClientService],
})
export class WalletClientModule {}
