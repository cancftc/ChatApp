export class ChatMessageModel {
    _id: string = "";
    userId: string = "";
    toUserId: string = "";
    messages: { message: string, messageUserId: string, messageId: string }[] = []; // messages alanını güncelledik
    online: boolean= false
    createdDate: string = ""; // createdDate alanını da ekledik
}