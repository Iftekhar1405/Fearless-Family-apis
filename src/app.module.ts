import { Module, ValidationPipe } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FamiliesModule } from './families/families.module';
import { MessagesModule } from './messages/messages.module';
import { APP_PIPE } from '@nestjs/core';
import { WebSocketModule } from './websocket/websocket.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://iftekharahmedxyz:helloworld@cluster0.uleqf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
    ),
    FamiliesModule,
    MessagesModule,
    WebSocketModule
  ],

  providers: [
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule { }
