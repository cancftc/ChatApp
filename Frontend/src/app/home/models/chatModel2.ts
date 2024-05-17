export class ChatModel2 {
    _id: string = "";
    userId: string = "";
    toUserId: string = "";
    messages: { message: string }[] = []; // messages alanını güncelledik
    createdDate: string = ""; // createdDate alanını da ekledik
}