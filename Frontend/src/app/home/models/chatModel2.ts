export class ChatMessageModel {
    _id: string = "";
    userId: string = "";
    toUserId: string = "";
    messages: { message: string, messageUserId: string }[] = []; // messages alanını güncelledik
    createdDate: string = ""; // createdDate alanını da ekledik
}