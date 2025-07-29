import { Module } from '@nestjs/common';

import { MessagesModule } from '../messages/messages.module';
import { FamiliesModule } from '../families/families.module';
import { WebSocketGateways } from './websocket.gateway';

@Module({
  imports: [MessagesModule, FamiliesModule],
  providers: [WebSocketGateways],
  exports: [WebSocketGateways],
})
export class WebSocketModule {}